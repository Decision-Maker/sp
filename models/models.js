var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var o = {schema:{}, model:{}};

o.schema.user = new Schema({
  name: String
});

o.schema.vote = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User' },
  room: {type: Schema.Types.ObjectId, ref: 'Room'},
  option: {type: Schema.Types.ObjectId, ref: 'Option'}
});

o.schema.room = new Schema({
  title: String
});

o.schema.option = new Schema({
  title: String,
  room: {type: Schema.Types.ObjectId, ref: 'Room'},
});

o.model.Option = mongoose.model('Option', o.schema.option, 'options');
o.model.Room = mongoose.model('Room', o.schema.room, 'rooms');
o.model.Vote = mongoose.model('Vote', o.schema.usage, 'votes');
o.model.User = mongoose.model('User', o.schema.user, 'users');

o.schema.option.virtual('count').get(function () {
	var id = this._id;
	var room = this.room;
	var c;
	o.model.Vote.count({'option': id, 'room': room}, function(err, count){
		if(err) return handleError(err);
		c = count;
	});
	return c;
});

/*optionSchema.virtual('count').get(function(){
  return Participant.where({'roomId':this.roomId,'optionId':this.optionId} ).count();
});*/

module.exports = o;
