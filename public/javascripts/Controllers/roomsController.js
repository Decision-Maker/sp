app.controller('RoomsCtrl', [
'$scope',
'$stateParams',
'$location',
'rooms',
'room',
'auth',
'user',
function($scope, $stateParams, $location, rooms, room, auth, user){


  $scope.room = room;
  $scope.vote = angular.copy($scope.room.options);
  $scope.user = user;
  $scope.message = "";
  $scope.new = [""];
  $scope.currentVote = null;
  $scope.error = "";

  $scope.url = $location.absUrl();

  console.log($scope.room);
  //alert(user);
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

  $scope.delete = function(i){
    if($scope.new.length < 2){
      return;
    }
    $scope.new.splice(i, 1);
  }

  $scope.submitNewOptions = function(){
    rooms.addOptions($stateParams.id, $scope.new);
    $scope.new = [""];
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
