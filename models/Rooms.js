var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
  title: String,
  options: [String],
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vote' }]
});

mongoose.model('Room', RoomSchema);
