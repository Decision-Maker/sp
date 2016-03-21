var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');
var FPP = require('../node_modules/voting-util/FPP');

function handleError(err){
	console.log("ERROR");
	console.log(err.toString());
}

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

//server is sent a list of votes in req.body
router.post('/:room/votes', function(req, res, next) {

  userCount = userCount + 1;
  //console.log('user: ' + userCount.toString());
  var newUser = new db.model.User({name: userCount.toString()});
  newUser.save(function(err, u){
	  // console.log('user saved');
		// console.log("body[0]: ", req.body[0]);
		switch(req.room.voteType){
			case 'FPP':
				FPP.vote(u, req.room, req.body[0], function(err){
						if(err) {handleError(err);}
						res.json({});
					});
				break;
			default:
				console.log('vote type not recognized');
				break;
		}
		/*
	    db.model.Option.findOne({title: req.body[0].title, room: req.room._id}, function(err, op){
	    if (err) {return handleError(err);}
			var vote;
	    vote = new db.model.Vote({room: req.room._id, user: u._id, option: op._id});
	    vote.save(function(err){
	      if(err) {handleError(err);}
		  //console.log('vote saved');
		  res.json({});
	    });
      });*/
  });
});

// Roomrequests ===============================================================
// =============================================================================

//Gets the correct room for given id
router.get('/:room', function(req, res) {
  var o = {title: req.room.title, options: [], votes: [], _id: req.room._id};

  db.model.Option.find({room: req.room._id}, function(err, ops){
	  if (err) handleError(err);
	  for (i = 0; i < ops.length; i++){
		  o.options.push(ops[i]);
	  }
	  res.json(o);
  });

});

//Gets all rooms, 
router.get('/', function(req, res, next) {
	//console.log("hello");
    db.model.Room.find(function(err, rooms){
      if(err){ return handleError(err); }
	  var posts = [];
	  for (i = 0; i < rooms.length; i++){
	  	//console.log(rooms[i].title);
	  	//console.log(rooms[i]._id);
		var p = {votes: [], title: rooms[i].title, options:[], _id: rooms[i]._id};
		db.model.Option.find({room: rooms[i]._id}, function(err, options){
			for(j = 0; j < options.length; j++){
				p.options.push(options[j].title);

			}
		});
		posts.push(p);
	  }
	  res.json(posts);
    });
});

//Save a room to the database
//***** responces should be built from saved object returns, rather than req data fix in final version******
router.post('/', function(req, res, next) {
  //console.log(req.body.title);
  var new_room = new db.model.Room({title: req.body.title});
    new_room.save(function(err, r){
	  if(err) {handleError(err);}
    //console.log("room saved");
	  var o = {votes: [], title: r.title, _id: r._id, options: []};
	  var om;
	  for (i = 0; i < req.body.options.length; i++){
	    om = new db.model.Option({title: req.body.options[i], room: r._id});
	    om.save(function(err){if(err) {handleError(err);} /*console.log("option created")*/});
	    o.options.push(req.body.options[i]);
      }
	  res.json(o);
  });
});

//RESULT REQUESTS=======================================================================
//======================================================================================

//get current results of the room
//results is a list of objects with the fields: {title: String, _id: ObjectID, count: int, room: ObjectID}

router.get('/:room/results', function(req, res, next) {
	FPP.getResult(req.room._id, function(err, results){
		res.json(results);
	});
});


module.exports = router;
