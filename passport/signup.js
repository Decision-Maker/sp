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
