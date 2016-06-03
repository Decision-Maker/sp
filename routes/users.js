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

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});



router.param('uname', function(req, res, next, id){
	db.model.User.findOne({name: id}, function(err, user){
		if(err) {next(err);}
		req.user = user;
		next();
	});
});

//unfinished\
//get user data
router.get('/profile', auth, function(req, res, next){
	var data = {
		user: {},
		created: [],
		voted: [],
		observe: []
	};
  db.model.User.findOne({_id: req.payload._id}, function(err, user){
    db.model.Room.find({created: user},function(err, rooms){
  		if(err){console.log('error in room.find');
				new Error('error in finding user created rooms');}
			//console.log('room.find.success');
  		data.created = rooms;
      db.model.Vote.find({user: user}).populate('room').exec(function(err, votes){
				//console.log('vote.find.success');
				for (i = 0; i < votes.length; i++){
          data.voted.push(votes[i].room);
        }
        db.model.Observe.find({user: user}).populate('room').exec(function(err, obs){
          for(i = 0; i < obs.length; i++){
            data.observe.push(obs[i].room);
          }
					//console.log(data.created);
					//console.log(data.voted);
					//console.log(data.observe);
          res.json(data);
        });
	    });
		});
	});
});

//validates token
router.get('/validateToken', auth, function(req, res, next){
  db.model.User.findOne({_id: req.payload._id}, function(err, user){
		if (user){
			return res.json({valid: true});
		}else{
			return res.json({valid: false});
		}
	});
});

//make new user
router.post('/register', function(req, res, next){   //make sure '/register' is the same as in auth factory
  if(!req.body.username || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'});
  }
  var nu = new db.model.User();
  db.model.User.findOne({name: req.body.username}, function(err, user){
		if (user){
			return res.status(400).json({message: 'Username is already taken'});
		}
	});
	// this code is still run even if user already exists :(
  nu.name = req.body.username;
  nu.setPassword(req.body.password);
  nu.save(function(err, user){
    if(err){return next(err);}
    return res.json({not_taken: true, token: user.generateJWT()});
  });
});

//login
router.post('/:uname', function(req, res, next){
	console.log("login: " + req.body.username);  //make sure ':uname' is the same as in auth factory
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }
    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});



module.exports = router;
