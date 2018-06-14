const express = require('express');
const data = require('../database');
const app = express();

app.use(express.static(__dirname + '/../client/dist'));

const passport = require('passport'),
  auth = require('./auth.js');

auth(passport);
app.use(passport.initialize());

let port = process.env.PORT || 3000;

app.get('/home/leaderboard', function (req, res) {
  data.leaderboardScore(function (err, data) {
    if (err) {
      console.log('not working')
      res.sendStatus(500);
    } else {
      console.log('get request is going through yay!')
      res.send(data);
    }
  });
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});