/*	  Copyright 2016 Devon Call, Zeke Hunter-Green, Paige Ormiston, Joe Renner, Jesse Sliter
This file is part of Myrge.
Myrge is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Myrge is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Myrge.  If not, see <http://www.gnu.org/licenses/>.	*/

app.controller('RoomsCtrl', [
'$scope',
'$stateParams',
'$location',
'$state',
'rooms',
'room',
'auth',
'user',
function($scope, $stateParams, $location, $state, rooms, room, auth, user){

  $scope.room = room;
  $scope.vote = angular.copy($scope.room.options);
  $scope.user = user;
  $scope.message = "";
  $scope.new = [""];
  $scope.currentVote = null;
  $scope.error = "";

  $scope.currentUser = auth.currentUser();

  $scope.url = $location.absUrl();

  if($scope.room.state == "options"){
    $scope.message = "This room is still being edited, come back later to vote";
  }

  console.log($scope.room);

  $scope.changeState = function(){
    rooms.changeState(room).success(function(data){
      console.log(data);
    });
  }

  for(var i = 0; i < user.data.voted.length; i++){
    if(user.data.voted[i]._id == $stateParams.id){
      $scope.message = "You have already voted in this poll. Voting again will update your previous vote";
    }
  }

  $scope.selectVote = function(option){
    $scope.currentVote = option;
    $scope.error = "";
  }

  $scope.addOption = function(event){
    $scope.new.push("");
  }

  $scope.removeOption = function(option){
    if($scope.vote.length <= 2){
      return;
    }
    rooms.removeOption($stateParams.id, option).success(function(data){
      $scope.vote = data.optns;
    })
  }

  $scope.delete = function(i){
    if($scope.new.length < 2){
      return;
    }
    $scope.new.splice(i, 1);
  }

  $scope.submitNewOptions = function(){

    var uniqueOptions = $scope.new.filter(function(item, pos, self){
      if(item === ""){
        return false;
      }
      for(i = pos + 1; i < self.length; i++){
        if(self[i] === item){
          return false;
        }
      }
      return true;
    });

    if(uniqueOptions.length == 0){
      $scope.error = "Please enter valid options"
      return;
    }

    rooms.addOptions($stateParams.id, uniqueOptions).then(function(data){
      console.log(data);
      $scope.vote = data.data.options;
    }, function(reason){
      console.log(reason);
    });
    //console.log(test);

  }

  //Used for drag and drop
  $scope.barConfig = {
      animation: 150,
      //handle: ".handle",
      onSort: function (/** ngSortEvent */evt){
          // @see https://github.com/RubaXa/Sortable/blob/master/ng-sortable.js#L18-L24
      }
  };

  $scope.addVote = function(){
    // console.log("original order")
    // for (i = 0; i < room.options.length; i++){
    //   console.log(room.options[i].title);
    // }
    //var vote = angular.copy($scope.vote);

    var vote = {
      options: [],
    };

    if($scope.room.voteType == "FPP"){
      if($scope.currentVote == null){
        $scope.error = "Please select an option before voting ¯\\\_(ツ)_/¯"
        return;
      }
      vote.options = [$scope.currentVote];
    }
    else if($scope.room.voteType == "Borda"){
      vote.options = angular.copy($scope.vote);
    }


    console.log(vote);
    rooms.addVote(room._id, vote)
    .then(function(responce){
      $location.path('results/' + $stateParams.id);
    });
    //$scope.body = '';
  };

}]);
