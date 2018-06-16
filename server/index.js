const express = require('express');
const data = require('../database');
const games = require('../database/index.js')
const app = express();
const getMathProblems = require('../sampleMathProblemGenerator.js')
const bodyParser = require('body-parser');
const users = require('../routes/users');
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: './ttsAuth.json'
});

const text = '1 + 1 = ?';

const request = {
  input: { text: text },
  voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
  audioConfig: { audioEncoding: 'MP3' }
};

client.synthesizeSpeech(request, (err, response) => {
  if (err) {
    throw err;
  }

  fs.writeFile('./TextToSpeech/output.mp3', response.audioContent, 'binary', err => {
    if (err) {
      throw err;
    }

    console.log('Audio content written to file: output.mp3');
  })
})

app.use(express.static(__dirname + '/../client/dist'));
app.use(bodyParser.urlencoded({extend:false}));


const passport = require('passport'),
auth = require('./auth.js');

//getting sample data into database
//getMathProblems.getMathProblems();

auth(passport);
app.use(passport.initialize());
app.use(bodyParser.json());
app.use('/users',users)

//Passport Config
require('../passport')(passport)

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


app.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login']
}));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login'}),
  function(req, res) {
    var googleId = req.user.profile.id;
    var displayName = req.user.profile.displayName;

    data.confirmUser(googleId, (err, results) => {
      if (err) {
        console.log(`error, cannot sign in`);
      } else if (!results.length) {
        console.log(`u don't exist, so save to database`);
        data.saveUser(googleId, displayName, (err, results) => {
          if (err) {
            console.log('not working');
          } else {
            console.log('congrats, you exist!!');
            console.log(results);
          }
        });
      } else {
        console.log(`it already here hunni`);
      }
    });

    res.redirect('/')
  });

app.get('/games', (req, res) => {
  console.log(req.url);
  games.retrieveGames((gameData) => {
    var data = JSON.stringify(gameData);
    res.status(200).send(data);
  });
});


app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});