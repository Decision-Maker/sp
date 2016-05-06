// Borda Count Voting system: for each vote, give each option a # of points equal to the # of candidates ranked lower

var db = require('../models/models');

var Borda = {};

// take room id, return winner of Borda algorithm
// does this work for ties?
Borda.getResult = function(room_id, callback){
	db.model.Option.find({room: room_id}, function(err, ops){ // get options list for the given room
		db.model.Vote.find({room: room_id}, function(err, votes){ // get votes for this room
			var results = []

			var linkedLists = makedLinkedVoteList(votes); // turn votes into array of linked lists
			var numOptions = ops.length;
			// initialize result list
			for(i = 0; i < numOptions; i++){
				var other = {title: ops[i].title};
				other.count = 0;
				results.push()
			}
			for(i = 0; i < linkedLists.length; i++){ // for each vote
				var num = numOptions - 1;
				var current = linkedLists[i];	 	// go through each option,
				while(current.next != null){
					var other;
					for (j = 0; j < numOptions; j++){	// trying to find this option in the results list
						if (current.title = results[j]){	// ??
							other = results[j];
						}
					}
					other.count += num;
					num--;
					current = current.next;
				}
			}
			results.sort(function(a, b){
				return b.count - a.count;
			});
			callback(null, results);

		});
	});
}

function fillCounts(room_id, ops, votes, callback){

}

function makeLinkedVoteList(votes){

}

function linkedListVoteTraversal(head, votes){

}


//pass a user, room, and options preference list; callback if desired
//weakness: does not check if options contains an option not present in room
Borda.vote = function(user, room, options, callback){

}

// helper for  preferential vote: go through the list of options, find the one with a given title
function find(title, list){
	for(i = 0; i < list.length; i++){
		if(title === list[i].title){
			return list[i];
		}
	}
	return null;
}

module.exports = Borda;
