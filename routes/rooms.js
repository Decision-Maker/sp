var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
var FPP = require('../voting-util/FPP');
var IRV = require('../voting-util/IRV');
var Borda = require('../voting-util/Borda');

function handleError(err){
	console.log("ERROR");
	console.log(err.toString());
}

function loadUser(req, res, next){
	console.log('checking/getting user');
	req.payload.username;
	db.model.User.findOne({name: req.payload.username}, function(err, u){
		if(err) handleError(err);
		if(!u) {
			res.status(550).json({error: true, message: 'user not found'});
		}else{
			req.user = u;
			return next();
		}
	});
}

// Param Functions==============================================================
// =============================================================================

//Preload a specific room
router.param('room',  function(req, res, next, id) {
  var query = db.model.Room.findById(id).populate("created");

  query.exec(function (err, room){
    if (err) { return next(err); }
    if (!room) { return next(new Error('can\'t find room')); }

    req.room = room;
    return next();
  });
});

//Observer
router.post('/:room/observe', auth, loadUser,  function(req, res, next){
	var obs = new db.model.Observer();
	obs.user = req.payload._id;
	obs.room = req.room._id;
	obs.save(function(err){
		if(err) {handleError(err)};
	});
});

// Option requests ===============================================================
// =============================================================================

function contains(e, l){
	console.log(e);
	for(var i = 0; i < l.length; i++){
		if(e === l[i].title){
			console.log('matched', i);
			return true;
		}
	}
	return false;
}

function makeOption(title, room, oldops){
	return new Promise(function(resolve, reject){
		if(contains(title, oldops)){
			return resolve(null);
		}
		var o = new db.model.Option({'title': title, 'room': room._id});
		o.save(function(err){
			console.log('new option');
			if(err) reject(err);
			resolve(o);
		});
	});
}

router.post('/:room/options', function(req, res, next){
	console.log('adding options');
	var ops = req.body.options.filter(function(e, i, a){
		for(var s = 0; s < i; s++){
			if(a[s] === e){
				return false;
			}
		}
		return true;
	});
	db.model.Option.find({room: req.room._id}, function(err, options){
		console.log(options);
		if(err) handleError(err);
		var p = [];
		for(var i = 0; i < ops.length; i++){
			p.push(makeOption(ops[i], req.room, options));
		}
		Promise.all(p).then(function(value){
			db.model.Option.find({room: req.room._id}, function(err, optns){
				if(err) handleError(err);
				res.json({message: 'success', error: false, options: optns});
			})
		}, function(reason){
			res.json({message: 'error making options', error: reason, options: []});
		});
	})
});

//server is sent options in req.body
/*router.post('/:room/options', function(req, res, next) {
	var option;
	var size = req.body.options.length;
	var error = false;
	var unique = true;
	for (i = 0; i < size; i++){
		  //console.log("loop started");
			unique = true;
			db.model.Option.findOne({room: req.room._id, title: req.body.options[i]}, function(err, opt){
					if (opt){
						unique = false;
					}
			});
			if (unique){
				option = new db.model.Option({room: req.room._id, title: req.body.options[i]});
				option.save(function(err){
						if(err) {
							handleError(err);
							res.json({message: "Error saving messages", error: true, options: []})
							console.error("save error");
							error = true;
						}
						//console.log("saved option");
						//console.log("option created")

				});
			}
  }
	if(!error){
		db.model.Option.find({room: req.room._id}, function(err, options){
			res.json({message: "options saved", error: false, options: options});
		});
	}
});*/
// Vote requests ===============================================================
// =============================================================================

//server is sent vote(s) in req.body
router.post('/:room/votes', auth, loadUser,  function(req, res, next) {

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
				console.log('use of IRV, IRV deprecated');
				IRV.vote(u, req.room, req.body.options, function(err){
						if(err) {handleError(err);}
						res.json({});
					});
				break;
			case 'Borda':
				Borda.vote(u, req.room, req.body.options, function(err){
					if(err) {handleError(err);}
					res.json({});
				});
				break
			default:
				console.log('vote type not recognized');
				break;
		}
	});
});

// Change Room State===========================================================
// ============================================================================
router.post('/:room/statechange', auth,  function(req, res, next) {
	db.model.User.findOne({name: req.payload.username}, function(err, u){
		if (err) {
			return handleError(err)
		}
		req.room.state = "voting";
		req.room.save(function(err){});
  	//db.model.Room.update({_id: req.room._id},{ $set: {state: "voting"}});
		//db.model.Room.findOne({_id: req.room._id}, function(err, roo){
			//console.log(roo);
		//})
		res.json({});
	})
});

// Roomrequests ===============================================================
// =============================================================================

//Gets the correct room for given id
router.get('/:room', function(req, res) {
  var o = {_id: req.room._id, title: req.room.title, voteType: req.room.voteType, created: req.room.created.name, state: req.room.state, options: []};
 // var o = {title: req.room.title, options: [], votes: [], _id: req.room._id, state: ''};
  db.model.Option.find({room: req.room._id}, function(err, ops){
	  if (err) handleError(err);
	  o.options = ops;
	  res.json(o);
  });

});

//Gets all rooms,
router.get('/', function(req, res, next) {
	//console.log("hello");
    db.model.Room.find({}, function(err, rooms){
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
router.post('/', auth, loadUser,  function(req, res, next) {
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
				console.log(results);
				res.json(results);
			});
			break;
		case 'IRV':
			IRV.getResult(req.room._id, function(err, results){
				res.json(results);
			});
			break;
		case 'Borda':
			Borda.getResult(req.room._id, function(err, results){
				console.log(results);
				res.json(results);
			})
			break;
		default:
			console.log('vote type not recognized');
			break;
	}

});


module.exports = router;
