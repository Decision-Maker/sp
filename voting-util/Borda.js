// Borda Count Voting system: for each vote, give each option a # of points equal to the # of candidates ranked lower

var db = require('../models/models');

var Borda = {};

// take room id, return winner of Borda algorithm
Borda.getResult = function(room_id, callback){
	db.model.Option.find({room: room_id}, function(err, ops){ // get options list for the given room
		db.model.Vote.find({room: room_id}, function(err, votes){ // get votes for this room
			var results = []
			console.log("VOTES", votes);
			console.log("OPS", ops);
			for(i = 0; i < ops.length; i++){
				var other = {title: ops[i].title};
				var currentCount = 0;
				console.log("this op id", ops[i]._id)
				for(j = 0; j < votes.length; j++){
					console.log("this Vote", votes[j].option);
					if(ops[i]._id == votes[j].option){
						console.log("HERE");
						currentCount = currentCount + votes[j].value;
					}
				}
				console.log(currentCount);
				other.count = currentCount;
				results.push(other);
			}
			callback(null, results);
		});
	});
}


Borda.vote = function(user, room, options, callback){
	if(!callback){
		callback = function(err){};
	}

	db.model.Vote.find({room: room._id, user: user._id}, function(err, votes){
		if(err){handleError(err);}
		if(votes.length > 0){
			console.log("user has already voted on this poll, replacing vote");
			db.model.Vote.remove({room: room._id, user: user._id}, function(err){
				newVote(user, room, options, callback);
			});
		}else{
			newVote(user, room, options, callback);
		}
	});
}

function newVote(user, room, options, callback){
	//get all the option of the room
	db.model.Option.find({room: room._id}, function(err, op){
		console.log("OPTIONS", options);
		for(i = 0; i < options.length; i++){
			var vote = new db.model.Vote({room: room._id, user: user._id, option: find(options[i].title, op)._id, value: options.length - i});
			// console.log("VOTE", vote);
			vote.save();
		}
		callback();
	});
}

// helper for IRV.vote: go through the list of options, find the one with a given title
function find(title, list){
	for(i = 0; i < list.length; i++){
		if(title === list[i].title){
			return list[i];
		}
	}
	return null;
}

module.exports = Borda;
