var passport = require('passport')
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
//var Room = mongoose.model('Room');
//var Vote = mongoose.model('Vote');

/* GET home page. */
router.get('/', auth, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/home', auth, function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// Param Functions==============================================================
// =============================================================================

//Commented out to use rooms.json
/*

//Preload a specific room
router.param('room', function(req, res, next, id) {
  var query = Room.findById(id);

  query.exec(function (err, room){
    if (err) { return next(err); }
    if (!room) { return next(new Error('can\'t find room')); }

    req.room = room;
    return next();
  });
});


// Vote requests ===============================================================
// =============================================================================

router.post('/rooms/:room/votes', function(req, res, next) {

  var vote = new Vote(req.body);
  vote.room =  req.room;
  vote.data = req.body

  vote.save(function(err, comment){
    if(err){ return next(err); }

    req.room.votes.push(vote);
    req.room.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

// Roomrequests ===============================================================
// =============================================================================

//Gets the correct room for given id
router.get('/rooms/:room', function(req, res) {
  req.room.populate('votes', function(err, room) {
    if (err) { return next(err); }

    res.json(room);
  });
});

//Gets all room, used for home page
router.get('/rooms', function(req, res, next) {
  Room.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

//Save a room to the database
router.post('/rooms', function(req, res, next) {
  var post = new Room(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});
*/
module.exports = router;
