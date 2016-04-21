var LocalStrategy = require('passport-local').Strategy;
var db = require('../models/models');
var crypto = require('crypto');
module = {};
module.exports = function(passport){
    passport.use('signup', new LocalStrategy({
        passReqToCallback : true;
    },
    function(req, username, password, done){
      create_user({'username': username}, function(err, user){
        //if server error
        if (err){
          console.log('Signup Error: '+err);
          return done(err);
        }
        //if username already exists
        if (user) {
          console.log('Username already exists');
          return done(null, false, {message: 'Username already exists'});
        } else {
          //create new user
          var newUser = new db.models.User();
          newUser.username = username;
          newUser.setPassword(password);
          newUser.save(function(err) {
              if (err){
                console.log('Error in savin user:'+err);
                throw err;
              }
              console.log('User signup successful');
              return done(null, newUser);
          })
        }
      })
    }

}

export(module);
