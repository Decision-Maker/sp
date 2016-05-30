app.controller('ResultsCtrl', [
'$scope',
'rooms',
'room',
'results',
function($scope, rooms, room, results){

  $scope.room = room;
  $scope.results = results;

  // console.log(results);

  $scope.getWinners = function(){
    var topscore = $scope.results.result[0].count;
    var w = []
    for(var i = 0; i < $scope.results.result.length; i++){
      if($scope.results.result[i].count === topscore){
         var thisObj = {};
         var longCount = $scope.results.result[i].count;
         var shortenedCount;
         if(room.voteType == "FPP"){
            shortenedCount = longCount; // dealing with integers so no change
         } else {
            shortenedCount = longCount.toFixed(2); // 2 decimal places max
         }
         console.log("shortenedCount", shortenedCount);
         var resultTitle = $scope.results.result[i].title;
         thisObj.title = resultTitle;
         thisObj.count = shortenedCount;
         w.push(thisObj);
      }
    }
    console.log("W", w);
    return w;
  }

  $scope.winners = $scope.getWinners();

  $scope.getTie = function(){
     if($scope.winners.length == 1){
        return "";
     } else {
        return "tie";
     }
  }

  $scope.tie = $scope.getTie();

  $scope.pointsVotes = function(){
     if(room.voteType == "Borda"){
        if($scope.winners[0].count > 1){
           return "points";
        } else {
           return "point";
        }
     }
     if(room.voteType == "FPP"){
        if($scope.winners[0].count > 1){
           return "votes";
        } else {
           return "vote";
        }
     }
  }

  $scope.pointsVotesString = $scope.pointsVotes();
}]);

app.controller('ProfileCtrl', [
'$scope',
'user',
function($scope, user){

  $scope.profile = user.data;


  console.log($scope.profile);

}]);
