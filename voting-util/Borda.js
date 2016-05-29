// Borda Count Voting system: for each vote, give each option a # of points equal to the # of candidates ranked lower
var db = require('../models/testModels');
var Borda = {};

// take room id, return a sorted list of objects reflecting result of Borda algorithm [{optionTitle: x, count: y},...]
Borda.getResult = function(room_id, callback){
	db.model.Option.find({room: room_id}, function(err, ops){ // get options list for the given room
		db.model.Vote.find({room: room_id}, function(err, votes){ // get votes for this room
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
		// user has already voted on this poll
 		if(match.length > 0){
			console.log("user has already voted on this poll");
			updateAllVotes(user, room, options).then(function(votes){
				callback(null, votes);
			}, function(reason){
				console.log('error in updating votes, Borda');
				console.log(reason);
			});
		// user's first vot in this poll
		} else {
			saveAllVotes(user, room, options).then(function(votes){
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
      v.push(saveVote(user, room, options[i], options.length/(i+1))); // exponential or linear?
   }
   return Promise.all(v);
}

function saveVote(user, room, option, bordaValue){
	return new Promise(function(resolve, reject){
		db.model.Option.find({room: room._id}, function(err, op){
			var vote = new db.model.Vote({room: room._id, user: user._id, option: find(option.title, op)._id, value: bordaValue});
			vote.save(function (err, vote) {
  				if (err) { console.error(err); reject(); };
  				resolve(vote);
			});
		});
	});
}

function updateAllVotes(user, room, options){
	var v = [];
   for (var i = 0; i < options.length; i++){
      v.push(updateVote(user, room, options[i], options.length/(i+1))); // exponential or linear?
   }
   return Promise.all(v);
}

function updateVote(user, room, option, bordaValue){
	return new Promise(function(resolve, reject){
		db.model.Option.findOne({room: room._id, title: option.title}, function(err, op){
			console.log("OPTION", option);
			console.log("OP", op);
			if(err) return handleError(err);
			db.model.Vote.update({user: user._id, room: room._id, option: find(option.title, op)._id}, {value: bordaValue}, function(err, vote){
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
