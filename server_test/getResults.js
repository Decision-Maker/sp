var mongoose = require('mongoose');
var db = require('../models/testModels');
var IRV = require('../voting-util/IRV');
var FPP = require('../voting-util/FPP');
var Borda = require('../voting-util/Borda');
mongoose.connect('mongodb://admin:123456@ds019268.mlab.com:19268/votingrooms');

var polls = [
   // {title: "letters", voteType: "Borda"},
   {title: "numbers", voteType: "FPP"},
   // {title: "best pet", options: ["rabbit","dog","cat","mouse","serpent"], created: "Lorgunli", voteType: "FPP"}*/
];

function getResult(pollName){
   return new Promise(function(resolve, reject){
      db.model.Room.findOne({title: pollName}, function(err, poll){
         switch(poll.voteType){
            case 'FPP':
               FPP.getResult(poll._id, function(err, result){
                  if(err) return reject(new Error("voting error"));
                  resolve(result);
               });
               break;

            case 'Borda':
               Borda.getResult(poll._id, function(err, result){
                  if(err) return reject(new Error("voting error"));
                  resolve(result);
               });
               break;

            default:
            console.log('unknown poll');
            reject(new Error("unknown poll"));
            break;
         }

      });
   });
}



function getAllResults(polls){
   var r = [];
   for (var i = 0; i < polls.length; i++){
      r.push(getResult(polls[i].title));
   }
   return Promise.all(r);
}

console.log("getting results...");
getAllResults(polls).then(function(val){
   console.log("exiting");
   process.exit(0);
}, function(reason){
   console.log('error in making votes');
   console.log(reason);
})
