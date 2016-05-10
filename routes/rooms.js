var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
var FPP = require('../voting-util/FPP');
var IRV = require('../voting-util/IRV');

function handleError(err){
	console.log("ERROR");
	console.log(err.toString());
}

// Param Functions==============================================================
// =============================================================================

//Preload a specific room
router.param('room',  function(req, res, next, id) {
  var query = db.model.Room.findById(id);

  query.exec(function (err, room){
    if (err) { return next(err); }
    if (!room) { return next(new Error('can\'t find room')); }

    req.room = room;
    return next();
  });
});

//Observer
router.post('/:room/observe', auth, function(req, res, next){
	var obs = new db.model.Observer();
	obs.user = req.payload._id;
	obs.room = req.room._id;
	obs.save(function(err){
		if(err) {handleError(err)};
	});
});

// Option requests ===============================================================
// =============================================================================

//server is sent options in req.body
router.post('/:room/votes', function(req, res, next) {
	var option;
	for (i = 0; i < req.body.options.length; i++){
	    option = new db.model.Option({room: req.room._id, title: req.body.options[i]});
	    option.save(function(err){if(err) {handleError(err);} /*console.log("option created")*/});
  	}
	res.json({});
});
// Vote requests ===============================================================
// =============================================================================

//server is sent vote(s) in req.body
router.post('/:room/votes', auth, function(req, res, next) {

	db.model.User.findOne({name: req.payload.username}, function(err, u){
		if (err) {return handleError(err)};
		switch(req.room.voteType){
			case 'FPP':
				FPP.vote(u, req.room, req.body.options[0], function(err){
						if(err) {handleError(err);}
						res.json({});
					});
				break;
			case 'IRV':
				IRV.vote(u, req.room, req.body.options, function(err){
						if(err) {handleError(err);}
						res.json({});
					});
				break;
			default:
				console.log('vote type not recognized');
				break;
		}
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
router.post('/', auth, function(req, res, next) {
  //console.log(req.body.title);
  var new_room = new db.model.Room({title: req.body.title, created: req.payload._id, voteType: req.body.type});
    new_room.save(function(err, r){
	  if(err) {handleError(err)};
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
	switch(req.room.voteType){
		case 'FPP':
			FPP.getResult(req.room._id, function(err, results){
				res.json(results);
			});
			break;
		case 'IRV':
			IRV.getResult(req.room._id, function(err, results){
				res.json(results);
			});
			break;
		default:
			console.log('vote type not recognized');
			break;
	}

});


module.exports = router;
