// Borda Count Voting system: comapre each pair of options one on one over every vote (n choose two comparisons)
// award winner one point, 1/2 point each for ties. Calculate total wins for each option.

var db = require('../models/models');

var pairwiseComparison = {};

// take room id, return winner of Borda algorithm
// does this work for ties?
pairwiseComparison.getResult = function(room_id, callback){
	db.model.Option.find({room: room_id}, function(err, ops){ // get options list for the given room
		db.model.Vote.find({room: room_id}, function(err, votes){ // get votes for this room
			var numOptions = ops.length;
			var results = [];
			var points = []; // initialize array to store point info. all zeroes.
			for (var i = 0; i < numOptions; i++) {
				point[i] = [];
				for (j = 0 ; j < numOptions; j++) {
					points[i][j] = 0;
				}
			}
			var linkedLists = makedLinkedVoteList(votes); // turn votes into array of linked lists

			for(i = 0; i < linkedLists.length; i++){ // for each vote


				current = linkedLists[i];	 	// go through each option,
				while(current.next != null){
					var A = current;
					if (A.next != null){
						var B = A.next;
						points[ops.indexOf(A)][ops.indexOf(B)] = points[ops.indexOf(A)][ops.indexOf(B)] + 1;
						while(B.next != null){
							B = B.next;
							points[ops.indexOf(A)][ops.indexOf(B)] = points[ops.indexOf(A)][ops.indexOf(B)] + 1;
						}
					}
					current = current.next;
				}
			}

			// need to go through points array, declare winner.



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
pairwiseComparison.vote = function(user, room, options, callback){

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

module.exports = pairwiseComparison;
