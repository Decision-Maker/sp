/*	  Copyright 2016 Devon Call, Zeke Hunter-Green, Paige Ormiston, Joe Renner, Jesse Sliter
This file is part of Myrge.
Myrge is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Myrge is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Myrge.  If not, see <http://www.gnu.org/licenses/>.	*/

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
