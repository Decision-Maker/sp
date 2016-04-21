// First Past the Post Voting Functions


var db = require('../models/models');


var FPP = {};

//adds a count field to each element in olist that is the total votes for those options
//room_id: current room
//olist: list of options
//callback: function(err, filled_olist)
function fillCounts(room_id, olist, callback){
	db.model.Vote.find({room: room_id}, function(err, votes){
		var newList = []
		for(i = 0; i < olist.length; i++){
			var other = {title: olist[i].title};
			other.count = votes.filter(function(v){return v.option.equals(olist[i]._id);}).length;
			newList.push(other);
		}
		callback(null, newList);
	});
}

//creates a list of option documents sorted in decending order of votes for a particular room and passes it to a callback function
//Room_Id: the room._id of the desired room to find the result of
//callback: function with fields: err, results
//			err: error
//			results: the list of sorted options
FPP.getResult = function(room_id, callback){
	db.model.Option.find({room: room_id}, function(err, ops){
		fillCounts(room_id, ops, function(err, results){
			results.sort(function(a, b){
				return b.count - a.count;
			});
			console.log(results[0].count);
			callback(null, results);
		});
	});
}

//casts a vote for the user in room for option then runs the callback
FPP.vote = function(user, room, option, callback){
	if(!callback){
		callback = function(err){};
	}
	db.model.Option.findOne({title: option.title, room: room._id}, function(err, op){
	    if (err) {return handleError(err);}
		  var vote;
	    vote = new db.model.Vote({room: room._id, user: user._id, option: op._id});
	    vote.save(function(err){
	      //if(err) {handleError(err);}
		  callback(err);
	    });
      });
}

module.exports = FPP;