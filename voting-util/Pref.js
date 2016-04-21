// Preferential voting system

var db = require('../models/models');

var Pref = ();

function find(title, list){
	for(i = 0; i < list.length; i++){
		if(title === list[i].title){
			return list[i];
		}
	}
	return null;
}

//pass a user, room, and options preference list; callback if desired
//weakness: does not check if options contains an option not present in room
Pref.vote = function(user, room, options, callback){
	if(!callback){
		callback = function(err){};
	}
	
	//get all the option of the room
	db.model.Option.find({room: room._id}, function(err, op){
		var curOp;
		var vote;
		var previousVote;
		
		//start with the last option and build to the first
		vote = new db.model.Vote({room: room._id, user: user._id, option: find(options[options.length - 1].title, op)._id});
		vote.save();
		previousVote = vote;
		
		for(i = options.length - 2; i >= 1; i--){
			vote = new db.model.Vote({room: room._id, user: user._id, option: find(options[i].title, op)._id, next: previousVote._id});
			vote.save();
			previousVote = vote;
		}
		vote = new db.model.Vote({room: room._id, user._id, option: find(options[0].title, op)._id, next: previousVote._id, head: true})
		
		callback();
	});
}
