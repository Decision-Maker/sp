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


for(var i = 0; i < users.length; i++){
    var nu = new db.model.User();
    nu.name = users[i].name;
    nu.setPassword(users[i].password);
    nu.save(function(err){
        if(err){console.log("error on save");}
        else{
            
console.log("saved " + nu.name);
        }
    });
    userObj.push(nu);
}

function getIDfromList(name, list){
    var user = list.filter(function(x){return x.name === name})[0];
    return user._id;
}

db.model.User.findOne({name: "Barikhik"}, function(err, us){
    if(err){console.log("ERROR");}
    console.log(us._id.equals(getIDfromList("Barikhik", userObj)));
});


// for(var i = 0; i < polls.length; i++){
//     var nu = new db.model.Room();
//     // nu.title
// }

for(var i = 0; i < users.length; i++){
    console.log(users[i]);
    db.model.User.remove({name: users[i].name}, function(err){
        if(err){console.log("Error on delete");}
        else{
            console.log(users[i]);
        }
    });
}

