var mongoose = require('mongoose');
var db = require('./models/models');
var IRV = require('./voting-util/IRV');

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

var saveUsers = new Promise(function(resolve, reject){
  var error = false;
  for(var i = 0; i < users.length; i++){
      var nu = new db.model.User();
      var savecount = 0;
      nu.name = users[i].name;
      nu.setPassword(users[i].password);
      nu.save(function(err){
          if(err){error == true}
          console.log(users[savecount].name);
          savecount++;
          if(savecount == users.length){
            if(error){
              reject(new Error("problem on save"));
            }else{
              resolve("");
            }
          }
      });
      userObj.push(nu);
  }
});

saveUsers.then(function(res){
  db.model.User.findOne({name: "Barikhik"}, function(err, us){
      if(err){console.log("ERROR");}
      console.log(us._id.equals(getIDfromList("Barikhik", userObj)));
      for(var i = 0; i < users.length; i++){
          console.log(users[i]);
          db.model.User.remove({name: users[i].name}, function(err, u){
              if(err){console.log("Error on delete");}
              else{
                  console.log(u);
              }
          });
      }
  });
});

// for(var i = 0; i < polls.length; i++){
//     var nu = new db.model.Room();
//     // nu.title
// }
