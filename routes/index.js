var passport = require('passport')
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../models/models');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET'});
//var Room = mongoose.model('Room');
//var Vote = mongoose.model('Vote');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/home', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
