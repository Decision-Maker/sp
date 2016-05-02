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
router.post('/:uname/profile', auth, function(req, res, next){
	var data = {
		user: {},
		created: [],
		voted: [],
		observe: []
	};
  db.model.User.findOne({_id: req.payload._id}, function(err, user){
    db.model.Room.find({created: user},function(err, rooms){
  		if(err){new Error('error in finding user created rooms');}
  		data.created = rooms;
      db.model.Vote.find({user: user}).populate('room').exec(function(err, votes){
        for (i = 0; i < votes.length; i++){
          data.voted.push(votes[i].room);
        }
        db.model.Observe.find({user: user}).populate('room').exec(function(err, obs){
          for(i = 0; i < obs.length; i++){
            data.observe.push(obs[i].room);
          }
          res.json(data);
        });
	    });
		});
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
