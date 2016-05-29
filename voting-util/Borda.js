// Borda Count Voting system: for each vote, give each option a # of points equal to the # of candidates ranked lower
var db = require('../models/models');
var Borda = {};

// take room id, return winner of Borda algorithm
Borda.getResult = function(room_id, callback){
	
	db.model.Option.find({room: room_id}, function(err, ops){ // get options list for the given room
		db.model.Vote.find({room: room_id}, function(err, votes){ // get votes for this room
			console.log('algorithm start');
			var results = []
			for(i = 0; i < ops.length; i++){
				var other = {title: ops[i].title};
				var currentCount = 0; // score to award to the current option
				for(j = 0; j < votes.length; j++){
					if(ops[i]._id.equals(votes[j].option)){
						currentCount = currentCount + votes[j].value;
					}
				}
				other.count = currentCount;
				results.push(other);
			}
			console.log('sorting start');
			results.sort(function(a, b){
				return b.count - a.count;
			});
			console.log(results);
			callback(null, results);
		});
	});
}


Borda.vote = function(user, room, options, callback){
	db.model.Vote.find({room: room._id}).populate('option user').exec(function(err, votes){
		if (err) {return handleError(err);}
		console.log("VOTES", votes);
		console.log("USER ID", user._id);
 		var match = votes.filter(function(e){return e.user._id.equals(user._id);});
 		if(match.length > 0){	// user has already voted on this poll
			console.log("user has already voted on this poll");
			updateAllVotes(user, room, options)
		} else {
			saveAllVotes(user, room, options).then(function(votes){
				// console.log("in borda then");
				callback(null, votes);
			}, function(reason){
				console.log('error in creating votes, Borda');
				console.log(reason);
			});
		}
	});
}

function saveAllVotes(user, room, options){
	var v = [];
   for (var i = 0; i < options.length; i++){
      v.push(saveVote(user, room, options[i], i));
   }
   return Promise.all(v);
}

function saveVote(user, room, option, i){
	return new Promise(function(resolve, reject){
		db.model.Option.find({room: room._id}, function(err, op){
			var vote = new db.model.Vote({room: room._id, user: user._id, option: find(option.title, op)._id, value: op.length/(i+1)}); // exponential or linear
			vote.save(function (err, vote) {
  				if (err) { console.error(err); reject(); };
  				resolve(vote);
			});
		});
	});
}

// helper for saveVote go through the list of options, find the one with a given title
function find(title, list){
	for(i = 0; i < list.length; i++){
		if(title === list[i].title){
			return list[i];
		}
	}
	return null;
}

module.exports = Borda;
