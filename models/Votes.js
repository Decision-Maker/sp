var mongoose = require('mongoose');

var VoteSchema = new mongoose.Schema({
  data: [[String]],
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
});

mongoose.model('Vote', VoteSchema);
