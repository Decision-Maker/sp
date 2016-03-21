var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var o = {schema:{}, model:{}};

o.schema.user = new Schema({
  name: String
});

o.schema.vote = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User' },
  room: {type: Schema.Types.ObjectId, ref: 'Room'},
  option: {type: Schema.Types.ObjectId, ref: 'Option'},
  next: {type: Schema.Types.ObjectId, ref: 'Vote', default: null}
});

o.schema.room = new Schema({
  title: String,
  voteType: {type: String, default: 'FPP'}
});

o.schema.option = new Schema({
  title: String,
  room: {type: Schema.Types.ObjectId, ref: 'Room'},
});

o.model.Option = mongoose.model('Option', o.schema.option, 'test_options');
o.model.Room = mongoose.model('Room', o.schema.room, 'test_rooms');
o.model.Vote = mongoose.model('Vote', o.schema.vote, 'test_votes');
o.model.User = mongoose.model('User', o.schema.user, 'test_users');

module.exports = o;
