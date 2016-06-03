/*	  Copyright 2016 Devon Call, Zeke Hunter-Green, Paige Ormiston, Joe Renner, Jesse Sliter
This file is part of Myrge.
Myrge is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Myrge is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Myrge.  If not, see <http://www.gnu.org/licenses/>.	*/

// First Past the Post Voting Functions
var db = require('../models/models');
var FPP = {};

//adds a count field to each element in olist that is the total votes for those options
//room_id: current room
//olist: list of options
//callback: function(err, filled_olist)
function fillCounts(room_id, olist, callback){
	db.model.Vote.find({room: room_id}).populate('user').exec(function(err, votes){
		var results = {};

		var newList = []; // the outcome of the poll
		for(i = 0; i < olist.length; i++){
			var other = {title: olist[i].title};
			other.count = votes.filter(function(v){return v.option.equals(olist[i]._id);}).length;
			newList.push(other);
		}
		newList.sort(function(a, b){
			return b.count - a.count;
		});
		results.result = newList;

		var users = []; // the users who voted in the poll
		for(i = 0; i < votes.length; i++){
			var currentUser = votes[i].user;
			if (users.indexOf(currentUser.name) == -1){
				users.push(currentUser.name);
			}
		}
		// sort users alphabetically
		users.sort(function(a, b){
    		if(a < b) return -1;
    		if(a > b) return 1;
    		return 0;
		});
		results.users = users;

		callback(null, results);
	});
}

//creates a list of option documents sorted in decending order of votes for a particular room and passes it to a callback function
//Room_Id: the room._id of the desired room to find the result of
//callback: function with fields: err, results
//			err: error
//			results: the list of sorted options
FPP.getResult = function(room_id, callback){
	db.model.Option.find({room: room_id}, function(err, ops){
		var results;
		fillCounts(room_id, ops, function(err, results){
			console.log("RESULTS", results);
			callback(null, results);
		});

	});
}

//casts a vote for the user in room for option then runs the callback
FPP.vote = function(user, room, option, callback){
	if(!callback){
		callback = function(err){};
	}
	db.model.Vote.find({room: room._id}).populate('option user').exec(function(err, votes){
	  if (err) {return handleError(err);}
		var match = votes.filter(function(e){return e.user._id.equals(user._id);});
		if(match.length > 0){
			db.model.Option.findOne({room: room._id, title: option.title}, function(err, op){
				if(err) return handleError(err);
				db.model.Vote.update({user: user._id, room: room._id}, {option: op._id}, callback);
			});

		}else{
			db.model.Option.findOne({room: room._id, title: option.title}, function(err, op){
				if(err) return handleError(err);
				if(!op) return handleError("null option");
				var vote = new db.model.Vote({room: room._id, user: user._id, option: op._id});
				vote.save(function(err){
					//if(err) {handleError(err);}
					callback(err);
				});
			});
		}
	});
}

module.exports = FPP;
