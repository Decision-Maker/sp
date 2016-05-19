var mongoose = require('mongoose');
var db = require('../models/models');
//var IRV = require('../voting-util/IRV');
var FPP = require('../voting-util/FPP');
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
                {name: "Arazzoli", password: "Cavebraid"}];

var polls = [{title: "best ale", options: ["brown","red","blonde","dark","light"], created: "Doungrak", voteType: "FPP"},
                {title: "best beard", options: ["bushy","big","short","fake","long"], created: "Kulaeck", voteType: "FPP"},
                {title: "favorite gem", options: ["ruby","emerald","diamond","amethyst","turquoise"], created: "Throfrig", voteType: "FPP"},
                {title: "best pet", options: ["rabbit","dog","cat","mouse","serpent"], created: "Lorgunli", voteType: "FPP"}];

var votes = [{user: "Barikhik", poll: "best ale", options: ["brown","red","blonde","dark","light"]}];

var userObj = [];

// takes user name string, list of user objects, returns one user object with matching name
function getUser(name, userList){
  var user = userList.filter(function(x){return x.name === name})[0];
  return user;
}

// takes list of poll objects, poll title as string, returns poll object with that title
function getPoll(title, pollsList){
  var poll = pollsList.filter(function(x){return x.poll.title === title})[0];
  return poll;
}

//
function getOptionList(userOrder, options){
  var optionList = [];
  for(var i = 0; i < userOrder.length; i++){
    optionList.push(options.filter(function(x){return x.title === userOrder[i]})[0]);
  }
  return optionList;
}

function createVote(vote, users, polls){
  return new Promise(function(resolve, reject){
    var userObject = getUser(vote.user, users);
    var pollObject = getPoll(vote.poll, polls);
    var optionsList = getOptionList(vote.options, pollObject.options);
    console.log(userObject)
    console.log()
    switch(pollObject.voteType){
      case 'FPP':
        FPP.vote(userObject, pollObject, optionsList[0], function(err){
          if(err) return reject(new Error("voting error"));
          console.log('voted');
          resolve(vote);
        });
        break;

      case 'IRV':
        IRV.vote(userObject, pollObject, optionsList, function(err){
          if(err) return reject(new Error("voting error"));
          resolve(vote);
        });
        break;
      default:
        reject(new Error("unknown voteType"));
        break;
    }
  });
}

function createAllVotes(votes, users, polls){
  console.log("voting started");
  var v = [];
  for (var i = 0; i < votes.length; i++){
    v.push(createVote(votes[i], users, polls));
  }
  return Promise.all(v);
}


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
  return Promise.all([users, createAllPolls(polls)]);
}, function(reason){
  console.log(reason); clean.go();
}).then(function(val){
  //make votes
  return Promise.all(val[0], val[1], createAllVotes(votes, val[0], val[1])); //[uP, pP, vP]
}, function(reason){
  console.log("error in voting");
  console.log(reason); clean.go();
}).then(function(val){
  //display everything
  for(var i = 0; i < val.length; i++){
    for(var j = 0; j < val[i].length; j++){
      console.log(val[i][j]);
    }
  }
    clean.go();
}, function(reason){console.err(reason); clean.go();});
