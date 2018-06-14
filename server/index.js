const express = require('express');
const data = require('../database');
const app = express();

app.use(express.static(__dirname + '/../client/dist'));

const passport = require('passport'),
  auth = require('./auth.js');

auth(passport);
app.use(passport.initialize());

let port = process.env.PORT || 3000;

<<<<<<< 5fcedc5b57c89545a3f4ff363420685b8411c3db
app.get('/home/leaderboard', function (req, res) {
  data.leaderboardScore(function (err, data) {
=======
//------------google oauth------------//
//redirects client to google login page
app.get('/', (req, res) => {
  console.log(req.user)
  // if (req.session.token) { //if token exists
  //   res.cookie('token', req.session.token); //set cookie
  //   res.json({
  //       status: 'session cookie set'
  //   });
  // } else {
  //   res.cookie('token', '') //cookie is not set
  //   res.json({
  //       status: 'session cookie not set'
  //   });
  // }
});

//redirects client to google login page
app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login']
}));

//keep key secret so cookie can't b stolen by 3rd parties
app.use(cookieSession({name: 'session', keys: ['810']}));
app.use(cookieParser());

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login'}),
  function(req, res) {
    let profileData = req.user
    res.redirect('/')
  });

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
>>>>>>> Redirects back to homepage after Google authentication
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