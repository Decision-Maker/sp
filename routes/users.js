var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');
var FPP = require('../voting-util/FPP');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'})

/* GET users listing. */
router.get('/', function(req, res, next) {
  db.model.User.find({}, function(err, users){
    res.json(users);
  });
});

router.param('user', function(req, res, next, id){
	db.model.User.findById(id, function(err, user){
		if(err) {next(err);}
		req.user = user;
		next();
	});
});

//unfinished\
//get user data
router.get('/:user', function(req, res, next){
	var data = {
		user: req.user,
		created: [],
		voted: [],
		observe: []
	};
	db.model.Room.find({created: req.user._id},function(err, rooms){
		if(err){new Error('error in finding user created rooms');}
		data.created = rooms;
		db.model.Vote.find({user: req.user._id}).populate('room').exec(function(err, votes){
      for (i = 0; i < votes.length; i++){
        data.voted.push(votes[i].room);
      }
      db.model.Observe.find({user: req.user._id}).populate('room').exec(function(err, obs){
        for(i = 0; i < obs.length; i++){
          data.observe.push(obs[i].room);
        }
        res.json(data);
      });
		});
	});
});

//make new user
router.post('/', function(req, res, next){
  if(!req.body.name || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'});
  }
  var nu = new db.model.User();
  //check if unique
  nu.name = req.body.name;
  nu.setPassword(req.body.password);
  nu.save(function(err, u){
    if(err){return next(err);}
    return res.json({not_taken: true, token: user.generateToken()});
  });
});

//login
router.post('/:uname', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateToken()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
})


module.exports = router;
