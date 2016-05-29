var mongoose = require('mongoose');
var o = require("./models");

//change names of collections for final production model
o.model.Option = mongoose.model('tOption', o.schema.option, 'test_options');
o.model.Room = mongoose.model('tRoom', o.schema.room, 'test_rooms');
o.model.Vote = mongoose.model('tVote', o.schema.vote, 'test_votes');
o.model.User = mongoose.model('tUser', o.schema.user, 'test_users');
o.model.Observe = mongoose.model('tObserve', o.schema.observe, 'test_observe');

module.exports = o;
