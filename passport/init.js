var login = require('./login');
var signup = require('./signup');
var db = require('../models/models');
module = {};
module.exports = function(passport){

  passport.serializeUser(function(user, done){
	db.models.User.findById(user.id, function(err, us){
		done(err, us.id);
	});
  });

  passport.deserializeUser(function(id, done) {
      db.models.User.findById(id, function(err, user) {
          done(err, user);
      });
  });

  // Setting up Passport Strategies for login and sign up
  login(passport);
  signup(passport);

}

export(module);
//to do:
//install passport stuff on server
//encryption
