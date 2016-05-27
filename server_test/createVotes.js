var mongoose = require('mongoose');
var db = require('../models/models');
var IRV = require('../voting-util/IRV');
var FPP = require('../voting-util/FPP');
var Borda = require('../voting-util/Borda');
mongoose.connect('mongodb://admin:123456@ds019268.mlab.com:19268/votingrooms');

var votes = [
            // TEST FPP
            // {user: "Barikhik", poll: "best ale", options: ["light","brown","red","dark","blonde"]},
            // {user: "Doungrak", poll: "best ale", options: ["red"]},
            // {user: "Kulaeck", poll: "best ale", options: ["brown"]},
            // {user: "Kulaeck", poll: "best ale", options: ["brown"]}, // same user can vote twice on same poll?

            // TEST Borda
            {user: "Throfrig",   poll: "best beard", options: ["big","bushy","braided"]}, //
            // {user: "Throfrig",   poll: "best beard", options: ["bushy","big","braided"]},
            // {user: "Lorgunli",   poll: "best beard", options: ["big","braided","bushy"]},
            // {user: "Groondon",   poll: "best beard", options: ["big","bushy","braided"]},
            // {user: "Noggouk",    poll: "best beard", options: ["braided","bushy","big"]},
            // {user: "Befrot",     poll: "best beard", options: ["braided","big","bushy"]}

            ];


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
                     Borda.vote(user, poll, optionsList, function(err){
                        if(err){ console.log("err"); }
                        resolve("Borda vote created");
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
   console.log("votes created");
   process.exit(0);
}, function(reason){
   console.log('error in making votes');
   console.log(reason);
})
