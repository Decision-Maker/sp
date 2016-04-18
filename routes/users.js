var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');
var FPP = require('../voting-util/FPP');

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

//just expoecting a name field in body currently
router.post('/', function(req, res, next){
  nu = new db.model.User({name: req.body.name});
  nu.save(function(err, u){if(err) new Error("problem saving user")});
});

//make new user

module.exports = router;
