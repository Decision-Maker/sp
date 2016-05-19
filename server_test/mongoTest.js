var mongoose = require('mongoose');
var db = require('../models/models');
//var IRV = require('../voting-util/IRV');
var clean = require('./clearData');


mongoose.connect('mongodb://admin:123456@ds019268.mlab.com:19268/votingrooms');

var users = [{name: "Barikhik", password: "Magmafury"},
                {name: "Doungrak", password: "Copperheart"},
                {name: "Kulaeck", password: "Oakjaw"},
                {name: "Throfrig", password: "Barrelbrow"},
                {name: "Lorgunli", password: "Smeltbraids"},
                {name: "Groondon", password: "Hammerbringer"},
                {name: "Noggouk", password: "Steelbreaker"},
                {name: "Befrot", password: "Bristletoe"},
                {name: "Bungrom", password: "Hornhead"},
                {name: "Arazzoli", password: "Cavebraid"}]

var polls = [{title: "best ale", options: ["brown","red","blonde","dark","light"], created: "Doungrak", voteType: "IRV"},
                {title: "best beard", options: ["bushy","big","short","fake","long"], created: "Kulaeck", voteType: "IRV"},
                {title: "favorite gem", options: ["ruby","emerald","diamond","amethyst","turquoise"], created: "Throfrig", voteType: "IRV"},
                {title: "best pet", options: ["rabbit","dog","cat","mouse","serpent"], created: "Lorgunli", voteType: "IRV"}]

var userObj = [];

function getIDfromList(name, list){
    var user = list.filter(function(x){return x.name === name})[0];
    return user._id;
}

function createUser(user){
  //console.log('makeing user, ' + user);
  return new Promise(function(resolve, reject){
    var nu = new db.model.User({name: user.name});
    nu.setPassword(user.password);
    nu.save(function(err){
      if(err){
        reject(new Error(nu.name + ', ' + err));
      }else{
        resolve(nu);
      }
    });
  });
}

function createAllUsers(users){
  var u = [];
  for (var i = 0; i < users.length; i++){
    u.push(createUser(users[i]));
  }
  return Promise.all(u);
}

function createOption(title, roomid){
  //console.log('creating option, ' + title);
  return new Promise(function(resolve, reject){
    var nu = new db.model.Option({title: title, room: roomid});
    nu.save(function(err){
      if(err) return reject(new Error(title + ', option creation, ' + err));
      resolve(nu);
    });
  });
}

function createPoll(poll){
  //console.log('creating poll, ' + poll);
  return new Promise(function(resolve, reject){
    var nu = new db.model.Room({title: poll.title, voteType: poll.voteType});
    db.model.User.findOne({name: poll.created}, function(err, user){
      if(err) return reject(new Error(poll.title + ', on finding user, ' + err));
      if(!user) return reject(new Error(poll.title + ', on finding user(user null), ' + err));
      nu.created = user._id;
      nu.save(function(err){
        if(err) return reject(new Error(poll.title + ', on creating room, ' + err));
        ops = [];
        for (var i = 0; i < poll.options.length; i++){
          ops.push(createOption(poll.options[i], nu._id));
        }
        Promise.all(ops).then(function(val){
          resolve({poll: nu, options: val});
        }, function(reason){
          reject(new Error('creating options, ' + reason));
        });
      });
    });
  });
}


function createAllPolls(polls){
  var p = [];
  for (var i = 0; i < polls.length; i++){
    p.push(createPoll(polls[i]));
  }
  return Promise.all(p);
}

createAllUsers(users).then(function(usrs){
  return Promise.all([usrs, createAllPolls(polls)]);
}, function(reason){
  console.log(reason); clean.go();
}).then(function(val){
  //make votes
  return val; //[uP, pP, vP]
}, function(reason){
  console.log(reason); clean.go();
}).then(function(val){
  //display everything
  for(var i = 0; i < val.length; i++){
    for(var j = 0; j < val[i].length; j++){
      console.log(val[i][j]);
    }
  }
  clean.go();
}, function(reason){console.log(reason); clean.go();});
