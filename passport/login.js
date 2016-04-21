var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('../models/models');
module = {};
module.exports = function(passport){
    passport.use('login', new LocalStrategy({
      passReqToCallback : true;
    },
    function(req, username, password, done) {
        db.models.user.findOne({'username' : username},
          function(err, user) {
              //server error
              if (err){
                return done(err);
              }
              //Username does not exist
              if (!user){
                console.log('Username not found');
                return done(null, false, {message: 'Incorrect username.'});
              }
              if (!user.validPassword(password)){
                console.log('Invalid password');
                return done(null, false, {message: 'Incorrect password.'});
              }
              return done(null, user);
          });
    }
  );

}
export(module);
