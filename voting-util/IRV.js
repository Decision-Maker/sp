// Instant-Runoff Voting system (IRV)

var db = require('../models/models');

var IRV = {};

// take room id, return winner of IRV algorithm
// does this work for ties?
IRV.getResult = function(room_id, callback){
	db.model.Option.find({room: room_id}, function(err, ops){ // get options list for the given room
		db.model.Vote.find({room: room_id}, function(err, votes){ // get votes for this room
			var linkedLists = makeLinkedVoteList(votes); // turn votes into array of linked lists
			var winner = false;
			while(!winner){
				fillCounts(room_id, ops, linkedLists, function(err, results){ // count up first preference votes like in FPP system
					results.sort(function(a, b){
						return b.count - a.count;
					});
					if(results[0] > (linkedLists.length/2)){ // If one option has the majority
						winner = true;
						callback(null, results);
					} else { // Need to remove the option in last place
						var loser = results[ops.length - 1] // least number of first place votes
						ops = ops.filter(function(o){return !o_id.equals(loser._id);});
						// REMOVE LOSER
						for(i = 0; i < linkedLists.length; i++){
							var current = linkedLists[i];
							if(current._id.equals(loser._id)){ // the head is the loser
								if(current.next != null){ // should always be the case?
									linkedLists[i] = current.next;
								}
							} else { 									// an option other than the head is the loser
								var previous = current;
								current = current.next;
								while(current != null){
									if(current._id.equals(loser._id)){ //?
										previous.next = current.next;
									}
									previous = current;
									current = current.next;
								}
							}
						}
					}
				});
			}
		});
	});
}

function fillCounts(room_id, ops, votes, callback){
	var newList = []
	for(i = 0; i < ops.length; i++){
		var other = {title: ops[i].title};
		other.count = votes.filter(function(v){return v.option.equals(ops[i]._id);}).length;
		newList.push(other);
	}
	callback(null, newList);
}

function makeLinkedVoteList(votes){
	var result = [];
	for(i = 0; i < votes.length; i++){
		if(votes[i].head){
			result.push(linkedListVoteTracersal(votes[i], votes));
		}
	}
	return results;
}

function linkedListVoteTraversal(head, votes){
	var current = head;
	while(current.next != null){ 	//ok?
		current.next = votes.filter(function(v){return v._id.equals(current.next)})[0];
		current = current.next;
	}
	return head;
}

//pass a user, room, and options preference list; callback if desired
//weakness: does not check if options contains an option not present in room
IRV.vote = function(user, room, options, callback){
	if(!callback){
		callback = function(err){};
	}

	db.model.Vote.find({room: room._id, user: user._id}, function(err, votes){
		if(err){handleError(err);}

		if(votes.length > 0){
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
		vote = new db.model.Vote({room: room._id, user: user._id, option: find(options[0].title, op)._id, next: previousVote._id, head: true})
		vote.save();

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

module.exports = IRV;
