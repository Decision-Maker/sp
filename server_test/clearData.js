var mongoose = require('mongoose');
var db = require('../models/models');

var o = {};

o.go = function(){
	var empty = new Promise(function(resolve, reject){
		db.model.User.remove({}, function(err){
			if(err){
				console.error(err);
			}
			db.model.Option.remove({}, function(err){
				if(err){
					console.error(err);
				}
				db.model.Observe.remove({}, function(err){
					if(err){
						console.error(err);
					}
					db.model.Room.remove({}, function(err){
						if(err){
							console.error(err);
						}
						db.model.Vote.remove({}, function(err){
							if(err){
								console.error(err);
							}
							resolve("");
						});
					})
				});
			});
		});
	});
	empty.then(function(res){
		process.exit(0);
	});
};

module.exports = o;
