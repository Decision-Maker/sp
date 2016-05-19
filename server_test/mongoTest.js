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

// takes user name string, list of user objects, returns one user object with matching name
function getUser(name, userList){
  var user = userList.filter(function(x){return x.name === name})[0];
  return user;
}

// takes list of poll objects, poll title as string, returns poll object with that title
function getPoll(title, pollsList){
  var poll = pollsList.filter(function(x){return x.title === title})[0];
  return poll;
}

//
function getOptionList(userOrder, optionTitles){
  var optionList = []
  for(var i = 0; i < userOrder.length; i++){
    optionList.push(optionTitles.filter(function(x){return x.title === userOrder[i]})[0]);
  }
  return optionList;
}

// var user = getUser("Barikhik", users);
// console.log(user);
// var poll = getPoll("best ale", polls)
// console.log(poll)
// var optionList = getOptionList(["red","dark","brown","light","blonde"], [{title: 'dark'}, {title: 'light'},{title: 'blonde'},{title: 'brown'},{title: 'red'}])
// console.log(optionList)

function vote(user, poll, options){

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

<<<<<<< HEAD
var uP = createAllUsers(users);

uP.then(function(usrs){
  var pP = createAllPolls(polls);
  pP
  .then(function(pls){
    return [usrs, pls];
  }, function(reason){
    console.err(reason); clean.go();
  })
  .then(function(val){
    //make votes
    return val; //[uP, pP, vP]
  }, function(reason){
    console.err(reason); clean.go();
  })
  .then(function(val){
    //display everything
    for(var i = 0; i < val.length; i++){
      for(var j = 0; j < val[i].length; j++){
        // console.log(val[i][j]);
      }
=======
createAllUsers(users).then(function(usrs){
  return Promise.all(users, createAllPolls(polls));
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
>>>>>>> parent of 8e74462... then statements now on single tier chain
    }
    clean.go();
  }, function(reason){console.err(reason); clean.go();});;
}, function(reason){console.err(reason); clean.go();});
