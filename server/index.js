//starting up express onto server
const express = require('express');
const bodyParser = require('body-parser'); //parses incoming req
const data = require('../database');
const app = express();

//import google oauth passport package 
const passport = require('passport'),
      auth = require('./auth.js'); 

//import cookie package
const cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session');


app.use(express.static(__dirname + '/../client/dist'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

auth(passport);
app.use(passport.initialize());

let port = process.env.PORT || 3000;

//------------google oauth------------//
//redirects client to google login page
app.get('/', (req, res) => {
  if (req.session.token) { //if token exists
    res.cookie('token', req.session.token); //set cookie
    res.json({
        status: 'session cookie set'
    });
  } else {
    res.cookie('token', '') //cookie is not set
    res.json({
        status: 'session cookie not set'
    });
  }
});

//redirects client to google login page
app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile']
}));

//keep key secret so cookie can't b stolen by 3rd parties
app.use(cookieSession({name: 'session', keys: ['810']}));
app.use(cookieParser());

//after google verifyes from func line 50, this func gets invoked immediately
app.get('/auth/google',
  passport.authenticate('google', {failureRedirect: '/'}),
  (req, res) => {
    console.log('redirect')
    req.session.token = req.user.token; //cookie?
    res.redirect('/'); //takes client to '/' (homepage)

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
  }
);

//google log out
app.get('/logout', (req, res) => {
    req.logout();
    req.session = null; //delete the set cookie
    res.redirect('/');
});
//------------google oauth end------------//

app.get('/api/currentUser', (req, res) => {
  res.send(req.user);
});
//get request for user info (includes email, global score, and score for each attempted quiz)-  this is for rendering scores on leaderboard
app.get('/home/leaderboard', function(req, res) {
  //fetch info from database
  data.leaderboardScore(function(err, data) {
    if (err) {
      console.log('not working')
      res.sendStatus(500);
    } else {
      console.log('get request is going through yay!')
      res.send(data);
    }
  });
});

//get request for quizzes - this is for rendering quiz under a SPECIFIC TOPIC (currently not being used atm :| )
app.get('/home/quizzes', function(req, res) {
  //hardcoded first argument in returnQuiz (edit l8r if gonna use this get req in the future)
  data.returnQuiz('dinosaur', function(err, data) {
    if (err) {
      res.sendStatus(500);
    } else {
      console.log('quiz information is fetched!');
      res.send(data);
    }
  });
});



app.use(passport.initialize());
app.use(passport.session());
//NOTE MAKE SURE TO CHANGE :EMAIL TO :GOOGLEID
//patch req updates db single score along w the quiz name
app.patch('/home/:googleId', function(req, res) {
  console.log('oi');

  //googleId is currently set to email (we have to change this because email doesn't exist in req info)
  var googleId = req.params.googleId; //middleware?

  //----coded example----//
  var quizName = req.body.quizName;
  var points = req.body.score;
  //----harcoded example end----//

  //use incrementScore func from db
    //this saves local scores in user info as well as increasing the global score on leaderboard info
  data.incrementScore(googleId, quizName, points, function(err, data) {
    if (err) {
      console.log('boo hoo, not working');
    } else {
      console.log('successfully saved scores!');
    }
  });
});

app.listen(port, () => {
  console.log(`YAY listening on port ${port}!!`);
});