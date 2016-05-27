// Instant-Runoff Voting system (IRV)

var db = require('../models/models');

var IRV = {};

// take room id, return winner of IRV algorithm
// does this work for ties?
IRV.getResult = function(room_id, callback){
	db.model.Option.find({room: room_id}, function(err, ops){ // get options list for the given room
		db.model.Vote.find({room: room_id}, function(err, votes){ // get all votes for this room
			var linkedLists = makeLinkedVoteList(votes); // turn votes into array of linked lists
			var winner = false;
			while(!winner){
				var counts = fillCounts(room_id, ops, linkedLists); // count up first preference votes like in FPP system
				counts = counts.sort(function(a, b){return b.count - a.count;});
				console.log("counts ", counts);
				console.log("needed to win ", linkedLists.length/2);
				if(counts[0].count >= (linkedLists.length/2)){ // If one option has the majority BREAKS TIES ARBITRARILY
					console.log("WINNER");
					winner = true;
					callback(null, counts); 																									// CHANGE TO LIST OF WINNERS
				} else { // Need to remove the option in last place
					var loser = counts[ops.length - 1] // least number of first place votes, BREAKS TIES ARBITRARILY
					console.log("loser", loser.title);
					ops = ops.filter(function(o){return !(o.title == loser.title);});
					console.log("options", ops);
					// REMOVE LOSER
					for(i = 0; i < linkedLists.length; i++){
						var current = linkedLists[i];
						// console.log("head", current);
						if(current.title == loser.title){ // the head is the loser
							console.log("found loser at head")
							if(current.next != null){ // should always be the case?
								linkedLists[i] = current.next;
								current.next.head = true;
								// console.log("current.next ", current.next);
							}
						} else {
							console.log("found loser in list"); 									// an option other than the head is the loser
							var previous = current;
							current = current.next;
							while(current){
								if(current.title == loser.title){
									previous.next = current.next;
								} else {
									previous = current;
								}
								current = current.next;
							}
						}
					}
				}
			}
		});
	});
}

function fillCounts(room_id, ops, votes){
	var newList = []

	for(i = 0; i < ops.length; i++){
		var other = {title: ops[i].title};
		other.count = votes.filter(function(v){return v.option.equals(ops[i]._id);}).length;
		newList.push(other);
	}
	return newList;
}

function makeLinkedVoteList(votes){
	var list = []; // list of heads
	for(i = 0; i < votes.length; i++){
		if(votes[i].head){
			list.push(linkedListVoteTraversal(votes[i], votes));
		}
	}
	return list;
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
		console.log(votes);
		if(votes.length > 0){
			console.log("user has already voted on this poll, replacing vote");
			db.model.Vote.remove({room: room._id, user: user._id}, function(err){
				newVote(user, room, options, callback);
			});
		}else{
			console.log("creating new vote");
			newVote(user, room, options, callback);
		}
	});
}

function newVote(user, room, options, callback){
	//get all the option of the room
	db.model.Option.find({room: room._id}, function(err, op){
		console.log(op);
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
