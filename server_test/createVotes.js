var mongoose = require('mongoose');
var db = require('../models/models');
var IRV = require('../voting-util/IRV');
var FPP = require('../voting-util/FPP');
var Borda = require('../voting-util/Borda');
mongoose.connect('mongodb://admin:123456@ds019268.mlab.com:19268/votingrooms');

var votes = [
            {user: "Barikhik", poll: "letters"},
            {user: "Doungrak", poll: "letters"},
            {user: "Kulaeck",  poll: "letters"},
            {user: "Throfrig", poll: "letters"},
            {user: "Lorgunli", poll: "letters"},
            {user: "Groondon", poll: "letters"},
            {user: "Noggouk",  poll: "letters"},
            {user: "Befrot",   poll: "letters"},
            {user: "Bungrom",  poll: "letters"},
            {user: "Arazzoli", poll: "letters"}
            ];

var opList = ["A","B","C", "D", "E", "F", "G"];

for(var i = 0; i < votes.length; i++){
   var holder = opList.slice();
   shuffle(holder);
   votes[i].options = holder;
}

function shuffle(array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }
    return array;
}

console.log(votes);

// createVote helper
function getOptionList(userOrder, options){
   var optionList = [];
   for(var i = 0; i < userOrder.length; i++){
      optionList.push(options.filter(function(x){return x.title === userOrder[i]})[0]);
   }
   return optionList;
}


function createVote(userName, pollName, userOrder){
   return new Promise(function(resolve, reject){
      db.model.User.findOne({'name': userName}, function(err, user){
         if(err){ console.log("err"); }
         db.model.Room.findOne({'title': pollName}, function(err, poll){
            if(err){ console.log("err"); }
            db.model.Option.find({'room': poll._id}, function(err, options){
               optionsList = getOptionList(userOrder, options);
               switch(poll.voteType){
                  case 'FPP':
                     FPP.vote(user, poll, optionsList[0], function(err){
                        if(err){ console.log("err"); }
                        resolve("FPP vote created");
                     });
                     break;
                  case 'IRV':
                     IRV.vote(user, poll, optionsList, function(err){
                        if(err){ console.log("err"); }
                        resolve("IRV vote created");
                     });
                     break;
                  case 'Borda':
                     Borda.vote(user, poll, optionsList, function(err, savedVotes){
                        if(err){ console.log("err"); }
                        resolve(savedVotes);
                     });
                     break;
                  default:
                     console.log('bad votetype');
                     reject(new Error("unknown voteType"));
                     break;
               }
            });
         });
      });
   });
}

function createAllVotes(votes){
   var v = [];
   for (var i = 0; i < votes.length; i++){
      v.push(createVote(votes[i].user, votes[i].poll, votes[i].options));
   }
   return Promise.all(v);
}

console.log("creating votes...");
createAllVotes(votes).then(function(val){
   // console.log("createVotes val", val)
   console.log("votes created");
   process.exit(0);
}, function(reason){
   console.log('error in making votes');
   console.log(reason);
})
