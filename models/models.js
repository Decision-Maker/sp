var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  id: ObjectId
});

var participantSchema = new Schema({
  userId: ObjectId,
  roomId: ObjectId,
  optionId: ObjectId
});

var roomSchema = new Schema({
  title: String,
  roomId: ObjectId
});

var optionSchema = new Schema({
  optionId: ObjectId,
  roomId: ObjectId,
  name: String
});

mongoose.model('Option', optionSchema);
mongoose.model('Room', roomSchema);
var Participant = mongoose.model('Participant', participantSchema);
mongoose.model('User', userSchema);

optionSchema.virtual('count').get(function(){
  return Participant.find({'roomId':this.roomId,'optionId':this.optionId} ).count();
});
