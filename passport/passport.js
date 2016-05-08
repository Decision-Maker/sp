//var express = require('express');
//var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var db = require('../models/models');

passport.use(new LocalStrategy(
  function(username, password, done) {
      console.log("login called");
      db.model.User.findOne({name: username},
        function(err, user) {
           //console.log("model.user.find: " + err);
            //server error
            if (err){
              return done(err);
            }
            //Username does not exist
            if (!user){
              console.log('Username not found');
              return done(null, false, {message: 'Incorrect username.'});
            }
            console.log(password);
            if (!user.validPassword(password)){
              console.log('Invalid password');
              return done(null, false, {message: 'Incorrect password.'});
            }
            return done(null, user);
        });
        console.log("user model called");
  })
);
