const _ = require("lodash");
const {casApiUrl, siteUrl} = require("./config");
const fetch = require("./fetch");

module.exports = ({cookie}) => {
  if (cookie) {
    const cookieValues = cookie.split(';').reduce((res, item) => {
      const data = item.trim().split('=');
      return { ...res, [data[0]]: data[1] };
    }, {});
    const { SCT_ID = ''} = cookieValues;
    if (!_.isEmpty(SCT_ID)) {
      const url = `${casApiUrl}/auth/sctIdVerify?sctId=${SCT_ID}`;
      return fetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => {
        if (res.status >= 200 && res.status < 300) {
          return Promise.resolve(res.json()).then(data => {
            const { errorCode } = data;
            if (errorCode) {
              return Promise.resolve({});
            } else {
              const { user } = data;
              const {_id: user_id = '', is_clinic_account = false, clinic = {}} = user;
              if (!_.isEmpty(user_id) && is_clinic_account && !_.isEmpty(clinic)) {
                const { _id, thirdPartyAuth = {}, review_state = 'PENDING' } = clinic;
                const { isLab = false, labToken = '' } = thirdPartyAuth;
                if (review_state === 'GRANT' && !_.isEmpty(_id) && isLab && !_.isEmpty(labToken)) {
                  return Promise.resolve({url: `${siteUrl}/${_id}`})
                } else {
                  return Promise.resolve({})
                }
              } else {
                return Promise.resolve({})
              }
            }
          });
        } else {
          return Promise.resolve({});
        }
      }).catch(() => Promise.resolve({}))
    } else {
      return Promise.resolve({});
    }
  } else {
    return Promise.resolve({});
  }
}