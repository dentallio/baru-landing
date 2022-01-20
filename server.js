const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

//App Setup
app.use(cors());
app.use(bodyParser.json({ type: '*/*' }));
app.use('/assets', express.static( __dirname + '/assets' ));
app.get('/', (req, res) => {
  res.end(fs.readFileSync(__dirname + `/index.html`, 'UTF-8'));
});
app.get('/healthcheck', (req, res) => {
  res.json({ msg: 'It works' });
});

module.exports = app;
