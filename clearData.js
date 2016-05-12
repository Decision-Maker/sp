var mongoose = require('mongoose');
var db = require('./models/models');

mongoose.connect('mongodb://admin:123456@ds019268.mlab.com:19268/votingrooms');

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
})