"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const fetchGithubUser = (username) => {
  const url =  'https://api.github.com/users/' + username;
  return rp({
    uri: url,
    headers: {
        'User-Agent': 'Flatiron-Slackbot-Lab'
    },
  });
};

const formatResponseText = (info, paramToGet) => {
  let rv = { mrkdwn: true };
  const EOL = '\n';
  rv.text = '*Github User: @' + info.login + ' (' + info.name + ')*:' + EOL;
  if (!paramToGet) {
    rv.text += 'Company: ' + info.company + EOL;
    rv.text += 'Location: ' + info.location + EOL;
    rv.text += 'Hireable: ' + info.hireable + EOL;
    rv.text += 'Githup Profile: ' + info.html_url + EOL;
  }
  else {
    rv.text += paramToGet.charAt(0).toUpperCase() + paramToGet.slice(1) + ': ';
    rv.text += info[paramToGet];
  }
  return rv;
};

app.get('/', (req,res) => {
  res.send('ok');
});

app.post('/', (req, res) => {
  if (!req.body.text) {
    res.status(400).end();
    return;
  }
  const cmd = req.body.text.split(' ');
  const user = cmd[0];
  const paramToGet = cmd[1];
  console.log({user: user, paramToGet:paramToGet});
  fetchGithubUser(user).then((resp) => {
    const result = JSON.parse(resp);
    res.send(formatResponseText(result, paramToGet));
  }).catch((err) => {
    res.status(err.statusCode).end();
  });
});

// This code "exports" a function 'listen` that can be used to start
// our server on the specified port.
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};
