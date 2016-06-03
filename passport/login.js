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
