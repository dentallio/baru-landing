const _ = require('lodash');
const fs = require('fs');
const express = require('express');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const compress = require('compression');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('./fetch');
const { casApiUrl, siteUrl, SESSION_NAME, SESSION_DOMAIN, SESSION_DB, SESSION_DB_COLLECTION } = require('./config');

const app = express();

const sessionMap = {
  resave: false,
  saveUninitialized: false,
  secret: 'yubaba web1 need money',
  proxy: true,
  name: SESSION_NAME,
  cookie: {
    sameSite: 'none',
    secure: true,
    expires: new Date(Date.now() + 60000),
    maxAge: 60000,
    domain: SESSION_DOMAIN,
  },
};

//App Setup
app.set('trust proxy', true);
app.set('trust proxy', 'loopback');
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: SESSION_DB,
      collection: SESSION_DB_COLLECTION,
      stringify: false,
    }),
    ...sessionMap,
  }),
);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(compress());
app.use(cors());
app.use('/assets', express.static( __dirname + '/assets' ));
app.get('/', (req, res) => {
  const {sctid = ''} = req.headers;
  if (!_.isEmpty(sctid)) {
    const url = `${casApiUrl}/auth/sctIdVerify?sctId=${sctid}`;
    fetch(url, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => {
      if (res.status >= 200 && res.status < 300) {
        return Promise.resolve(res.json()).then(data => {
          const { errorCode } = data;
          if (errorCode) {
            res.end(fs.readFileSync(__dirname + `/index.html`, 'UTF-8'));
          } else {
            const { user } = data;
            const {_id: user_id = '', is_clinic_account = false, clinic = {}} = user;
            if (!_.isEmpty(user_id) && is_clinic_account && !_.isEmpty(clinic)) {
              const { _id, thirdPartyAuth = {}, review_state = 'PENDING' } = clinic;
              const { isLab = false, labToken = '' } = thirdPartyAuth;
              if (review_state !== 'GRANT' && _.isEmpty(_id) && isLab && !_.isEmpty(labToken)) {
                res.redirect(301, `${siteUrl}/${_id}`);
              }
              res.end(fs.readFileSync(__dirname + `/index.html`, 'UTF-8'));
            }
            res.end(fs.readFileSync(__dirname + `/index.html`, 'UTF-8'));
          }
        });
      }
      res.end(fs.readFileSync(__dirname + `/index.html`, 'UTF-8'));
    }).catch(() => res.end(fs.readFileSync(__dirname + `/index.html`, 'UTF-8')))
  } else {
    res.end(fs.readFileSync(__dirname + `/index.html`, 'UTF-8'));
  }
});
app.get('/healthcheck', (req, res) => {
  res.json({ msg: 'It works' });
});

module.exports = app;
