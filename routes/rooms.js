var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');

// Param Functions==============================================================
// =============================================================================

//Preload a specific room
router.param('room', function(req, res, next, id) {
  var query = db.model.Room.findById(id);

  query.exec(function (err, room){
    if (err) { return next(err); }
    if (!room) { return next(new Error('can\'t find room')); }

    req.room = room;
    return next();
  });
});


// Vote requests ===============================================================
// =============================================================================
var userCount = 0;

router.post('/:room/votes', function(req, res, next) {

  userCount = userCount + 1;
  var newUser = new db.model.User({name: userCount.toString()});
  var vote;
  db.model.Option.findOne({title: req.body[0], room: req.room._id}, function(err, op){
	  if (err) return handleError(err);
	  vote = new db.model.Vote({room: req.room._id, user: newUser._id, option: op._id});
	  vote.save(function(err){
	    if(err) handleError(err);
	  });
  });
});

// Roomrequests ===============================================================
// =============================================================================

//Gets the correct room for given id
router.get('/:room', function(req, res) {
  var o = {title: req.room.title, options: []};
  
  db.model.Option.find({room: req.room._id}, function(err, ops){
	  if (err) handleError(err);
	  for (op in ops){
		  o.options.push(op);
	  }
	  res.json(o);
  });
  
});

//Gets all room, used for home page
router.get('/', function(req, res, next) {
  db.model.Room.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

//Save a room to the database
//Devon's version
router.post('/', function(req, res, next) {
  var new_room = new db.model.Room({title: req.body.title});
  new_room.save(function(err){if(err) handleError(err)});
  var o = {};  
  o.title = new_room.title;
  o.options = [];
  
  for (op in req.body.options){
	  db.model.Option.create({title: op, room: new_room._id}).save(function(err){if(err) handleError(err)});
	  o.options.push(op);
  }
  
  res.json(o);
});

module.exports = router;