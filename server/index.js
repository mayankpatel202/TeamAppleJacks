const express = require('express');
const data = require('../database');
const games = require('../database/index.js')
const app = express();
const getMathProblems = require('../sampleMathProblemGenerator.js')
const bodyParser = require('body-parser');
const users = require('../routes/users');
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');
const path = require('path');

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: './ttsAuth.json'
});

app.use(express.static(__dirname + '/../client/dist'));
app.use(bodyParser.urlencoded({
  extend: false
}));

const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const _ = require('underscore');

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIo(server);

// const gameFunction = require('./gamefunction.js');

app.use(express.json());

const passport = require('passport'),
  auth = require('./auth.js');

//getting sample data into database
//getMathProblems.getMathProblems();

const passport = require('passport'),
  auth = require('./auth.js');
auth(passport);
app.use(passport.initialize());
app.use(bodyParser.json());
app.use('/users', users)

//Passport Config
require('../passport')(passport)


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

let count = 0;

app.post('/quizQuestion', function (req, res) {
  console.log('This is the req bod', req.body)
  const text = req.body.question;
  count++
  console.log(text)

  const request = {
    input: {
      text: text
    },
    voice: {
      languageCode: 'en-US',
      ssmlGender: 'NEUTRAL'
    },
    audioConfig: {
      audioEncoding: 'MP3'
    }
  };

  client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      throw err;
    }
    // Res.send(500) instead of throwing err like that so it doesn't crash
    // Show error on the clientside


    fs.writeFile(__dirname + `/../client/dist/output${count}.mp3`, response.audioContent, 'binary', err => {
      if (err) {
        throw err;
      }

      console.log('Audio content written to file: output.mp3');
      res.send('written');
    });
  });
});

app.get('/output', function (req, res) {

  let count = req.params.count
  console.log('This is the count', count)

  res.sendFile(__dirname + `/output1.mp3`, function (err) {
    if (err) {
      throw err;
    }

    console.log('File sent')
  })
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function (req, res) {
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

//gets game data from database
app.get('/game', (req, res) => {
  games.retrieveGames(res);
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), function (err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

var dummy = require('./mathTrivia.js').data.results;
var parser = require('socket.io-parser');
var encoder = new parser.Encoder();

app.get('/game', function (req, res) {
  if (req.user) {
    res.send(req.user.profile.id)
  } else {
    res.redirect('/auth/login')
  }
})

var question = dummy[0]
question.incorrect_answers.push(question.correct_answer)
question.incorrect_answers = _.shuffle(question.incorrect_answers);


io.on('connection', socket => {
  // console.log(socket.server.httpServer._connections, 'user connected')


  let q1 = {
    question: question.question,
    options: question.incorrect_answers
  }

  socket.emit('q1', q1);




  socket.on('disconnect', () => {
    console.log('user disconeccted')
  })


})

server.listen(port, () => console.log(`Listening on port: ${port}`))