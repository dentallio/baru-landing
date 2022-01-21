const _ = require('lodash');
const fs = require('fs');
const express = require('express');
const compress = require('compression');
const bodyParser = require('body-parser');
const cors = require('cors');
const services = require('./services');

const app = express();

//App Setup
app.set('trust proxy', true);
app.set('trust proxy', 'loopback');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(compress());
app.use(cors());
app.use('/assets', express.static( __dirname + '/assets' ));
app.get('/', (req, res) => {
  const { headers: { cookie } } = req;
  services({cookie})
    .then(({url = ""}) => {
      if (!_.isEmpty(url)) {
        res.redirect(301, url);
      } else {
        res.end(fs.readFileSync(__dirname + `/index.html`, 'UTF-8'));
      }
    })
});

app.get('/landingLogout', (req, res) => {
  const { headers: { cookie } } = req;
  console.log("cookie: ", cookie);
  res.clearCookie('SCT_ID');
  res.end(fs.readFileSync(__dirname + `/index.html`, 'UTF-8'));
});

app.get('/healthcheck', (req, res) => {
  res.json({ msg: 'It works' });
});

module.exports = app;
