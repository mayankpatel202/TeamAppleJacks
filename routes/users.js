const express = require('express');
const router = express.Router();
const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

//load Input Validation
const validateRegisterInput = require ('../validation/register');
const validateLoginInput = require ('../validation/login');

const User =  require('../database/index.js');

// @route   GET /users/register
// @desc    Register users
// @access  Public

router.post('/register',(req,res) => {
  const {errors, isValid} = validateRegisterInput(req.body);

  //check validation
  if (!isValid){
    return res.status(400).json(errors);
  }
  const userEmail=req.body.email;
  User.findOne({email:userEmail})
  .then(user => {
    if (user){
      errors.email = 'Email already exists'
        return res.status(400).json(errors.email);
      }else {
    const newUser =  new User({
        name: req.body.name,
        email: req.body.email,
        password:req.body.password
      });

    bcrypt.genSalt(10,(err,salt) =>{
      bcrypt.hash(newUser.password,salt,(err,hash)=>{
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
      })
    })
    }
  })
})

// router.get('/register',(req,res) => {

//   res.send('good morning, it is a nice day')
// })

// @route   GET /users/login
// @desc    Login Users/Returning JWT Token
// @access  Public



module.exports = router;



