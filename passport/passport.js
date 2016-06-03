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
