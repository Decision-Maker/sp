// Borda Count Voting system: for each vote, give each option a # of points equal to the # of candidates ranked lower

var db = require('../models/models');

var Borda = {};

// take room id, return winner of Borda algorithm
Borda.getResult = function(room_id, callback){
	db.model.Option.find({room: room_id}, function(err, ops){ // get options list for the given room
		db.model.Vote.find({room: room_id}, function(err, votes){ // get votes for this room
			var results = []
			console.log("VOTES", votes);
			// console.log("OPS", ops);
			for(i = 0; i < ops.length; i++){
				var other = {title: ops[i].title};
				var currentCount = 0;
				// console.log("option id", ops[i]._id)
				for(j = 0; j < votes.length; j++){
					// console.log("vote   id", votes[j].option);
					if(ops[i]._id.equals(votes[j].option)){
						// console.log("HERE");
						currentCount = currentCount + votes[j].value;
					}
				}
				// console.log("");
				// console.log(currentCount);
				other.count = currentCount;
				results.push(other);
			}
			console.log(results);
			callback(null, results);
		});
	});
}


Borda.vote = function(user, room, options, callback){
	// console.log("USER", user);
	// console.log("ROOM", room);
	// console.log("OPTIONS", options);
	saveAllVotes(user, room, options).then(function(votes){
		// console.log("in borda then");
		callback(null, votes);
	}, function(reason){
		console.log('error in making users');
   	console.log(reason);
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
			var vote = new db.model.Vote({room: room._id, user: user._id, option: find(option.title, op)._id, value: op.length - i});
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
