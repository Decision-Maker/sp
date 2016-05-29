var mongoose = require('mongoose');
var db = require('../models/testModels');
mongoose.connect('mongodb://admin:123456@ds019268.mlab.com:19268/votingrooms');
var users = [
            {name: "Barikhik", password: "Magmafury"},
            {name: "Doungrak", password: "Copperheart"},
            {name: "Kulaeck", password: "Oakjaw"},
            {name: "Throfrig", password: "Barrelbrow"},
            {name: "Lorgunli", password: "Smeltbraids"},
            {name: "Groondon", password: "Hammerbringer"},
            {name: "Noggouk", password: "Steelbreaker"},
            {name: "Befrot", password: "Bristletoe"},
            {name: "Bungrom", password: "Hornhead"},
            {name: "Arazzoli", password: "Cavebraid"}

            ];

function createUser(user){
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

console.log("creating users...");
createAllUsers(users).then(function(usrs){
   console.log("users created");
   process.exit(0);
}, function(reason){
   console.log('error in making users');
   console.log(reason);
})
