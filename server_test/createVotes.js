var mongoose = require('mongoose');
var db = require('../models/models');
var IRV = require('../voting-util/IRV');
var FPP = require('../voting-util/FPP');
mongoose.connect('mongodb://admin:123456@ds019268.mlab.com:19268/votingrooms');

var votes = [
            // TEST FPP
            {user: "Barikhik", poll: "best ale", options: ["brown"]},
            {user: "Doungrak", poll: "best ale", options: ["red"]},
            {user: "Kulaeck", poll: "best ale", options: ["brown"]},
            {user: "Kulaeck", poll: "best ale", options: ["brown"]}, // same user can vote twice on same poll?

            // TEST IRV
            // {user: "Throfrig",   poll: "best beard", options: ["big","bushy","braided"]}, // eliminate bushy, big wins
            {user: "Throfrig",   poll: "best beard", options: ["bushy","big","braided"]},
            {user: "Lorgunli",   poll: "best beard", options: ["big","braided","bushy"]},
            {user: "Groondon",   poll: "best beard", options: ["big","bushy","braided"]},
            {user: "Noggouk",    poll: "best beard", options: ["braided","bushy","big"]},
            {user: "Befrot",     poll: "best beard", options: ["braided","big","bushy"]}

            ];


// // createVote helper: takes user name string, list of user objects, returns one user object with matching name
// function getUser(name, userList){
//    var user = userList.filter(function(x){return x.name === name})[0];
//    return user;
// }
//
// // createVote helper:takes list of poll objects, poll title as string, returns poll object with that title
// function getPoll(title, pollsList){
//    var poll = pollsList.filter(function(x){return x.poll.title === title})[0];
//    return poll;
// }
//
// // createVote helper
// function getOptionList(userOrder, options){
//    var optionList = [];
//    for(var i = 0; i < userOrder.length; i++){
//       optionList.push(options.filter(function(x){return x.title === userOrder[i]})[0]);
//    }
//    return optionList;
// }

function createVote(vote, poll, user){
   return new Promise(function(resolve, reject){
      // var userObject = getUser(vote.user, users);
      // var pollObject = getPoll(vote.poll, polls);
      // var optionsList = getOptionList(vote.options, pollObject.options);
      switch(poll.voteType){
         case 'FPP':
         console.log("creating FPP vote");
         FPP.vote(userObject, pollObject.poll, optionsList[0], function(err){
            if(err) return reject(new Error("voting error"));
            // console.log("created fpp");
            resolve(vote);
         });
         break;
         case 'IRV':
         console.log("creating IRV vote");
         IRV.vote(userObject, pollObject.poll, optionsList, function(err){
            if(err) return reject(new Error("voting error"));
            resolve(vote);
         });
         break;
         default:
         console.log('bad votetype');
         reject(new Error("unknown voteType"));
         break;
      }
   });
}

function findPoll(pollName){
   // console.log("in findPoll searching for", pollName)
   return new Promise(function(resolve, reject){
      db.model.Room.findOne({title: pollName}, function(err, poll){
         console.log(poll);
         if(err){
             reject(new Error("poll not found"));
         } else {
            resolve(poll);
         }
      });
   });
}

function findUser(userName){
   return new Promise(function(resolve, reject){
      console.log("got here");
      db.model.User.findOne({name: userName}, function(err, user){
         if(err) return reject(new Error("user not found"));
         console.log(user)
         resolve(user);
      });
   })
}


function createAllVotes(votes){
   var v = [];
   for (var i = 0; i < votes.length; i++){
      // find the user and poll
      var userName = votes[0].user;
      var pollName = votes[0].poll;

      console.log("finding ", pollName);
      findPoll(pollName).then(function(val){
         console.log(val);
         console.log("in then");
         return Promise.all([val[0], findUser(userName)]);
      }, function(reason){
         console.log('error finding poll');
      }).then(function(val){
         v.push(createVote(votes[i], val[0], val[1]));
      }, function(reason){
         console.log("error in voting");
      });
   }
   console.log("returning votes promise");
   return Promise.all(v);
}

console.log("creating votes...");
createAllVotes(votes).then(function(val){
   console.log("votes created");
   process.exit(0);
}, function(reason){
   console.log('error in making votes');
   console.log(reason);
})
