var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');
var FPP = require('../voting-util/FPP');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.param('user', function(req, res, next, id){
	db.model.User.findById(id, function(err, user){
		if(err) {next(err);}
		req.user = user;
		next();
	});
});

//unfinished
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
		db.model.Vote.populate({user: req.user._id}, function(err, votes){
			
		});
	});
});

module.exports = router;
