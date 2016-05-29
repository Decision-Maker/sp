var mongoose = require('mongoose');
var db = require('../models/testModels');
mongoose.connect('mongodb://admin:123456@ds019268.mlab.com:19268/votingrooms');

var polls = [
            {title: "letters", options: ["A","B","C", "D", "E", "F", "G"], created: "Kulaeck", voteType: "FPP"} ,
            {title: "numbers", options: ["one","two","three","four","five"], created: "Doungrak", voteType: "FPP"},

            ];

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

console.log("creating polls...");
createAllPolls(polls).then(function(val){
   console.log("polls created");
   process.exit(0);
}, function(reason){
   console.log('error in making polls');
   console.log(reason);
})
