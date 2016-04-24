var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var o = {schema:{}, model:{}};

o.schema.user = new Schema({
  name: String,
  hash: {type: String, default: null},
  salt: {type: String, default: null}
});

o.schema.user.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

o.schema.user.methods.validPassword = function(passport){
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

o.schema.user.methods.generateJWT = function() {
  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');

};

o.schema.vote = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User' },
  room: {type: Schema.Types.ObjectId, ref: 'Room'},
  option: {type: Schema.Types.ObjectId, ref: 'Option'},
  next: {type: Schema.Types.ObjectId, ref: 'Vote', default: null},
  head: {type: Boolean, default: false}
});

o.schema.room = new Schema({
  title: String,
  voteType: {type: String, default: 'FPP'},
  created: {type: Schema.Types.ObjectId, ref: 'User', default: null}
});

//voting systems: perferential, point based

o.schema.option = new Schema({
  title: String,
  room: {type: Schema.Types.ObjectId, ref: 'Room'},
});


o.schema.observe = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	room: {type: Schema.Types.ObjectId, ref: 'Room'}
});

//change names of collections for final production model
o.model.Option = mongoose.model('Option', o.schema.option, 'test_options');
o.model.Room = mongoose.model('Room', o.schema.room, 'test_rooms');
o.model.Vote = mongoose.model('Vote', o.schema.vote, 'test_votes');
o.model.User = mongoose.model('User', o.schema.user, 'test_users');
o.model.Observe = mongoose.model('Observe', o.schema.observe, 'test_observe');

module.exports = o;
