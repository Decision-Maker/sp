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

o.schema.user.methods.validPassword = function(password){
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
    username: this.name,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');

};

o.schema.vote = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User' },
  room: {type: Schema.Types.ObjectId, ref: 'Room'},
  option: {type: Schema.Types.ObjectId, ref: 'Option'},
  next: {type: Schema.Types.ObjectId, ref: 'Vote', default: null},
  head: {type: Boolean, default: false},
  value: {type: Number, default: 0}
});

o.schema.room = new Schema({
  title: String,
  voteType: {type: String, default: 'FPP'},
  created: {type: Schema.Types.ObjectId, ref: 'User', default: null},
  state: {type: String, default: 'options'}
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
o.model.Option = mongoose.model('Option', o.schema.option, 'options');
o.model.Room = mongoose.model('Room', o.schema.room, 'rooms');
o.model.Vote = mongoose.model('Vote', o.schema.vote, 'votes');
o.model.User = mongoose.model('User', o.schema.user, 'users');
o.model.Observe = mongoose.model('Observe', o.schema.observe, 'observe');

module.exports = o;
