app.controller('ResultsCtrl', [
'$scope',
'rooms',
'room',
'results',
function($scope, rooms, room, results){

  $scope.room = room;
  $scope.results = results;

  console.log(results);

  $scope.getWinners = function(){
    var topscore = $scope.results.result[0].count;
    var w = []
    for(var i = 0; i < $scope.results.result.length; i++){
      if($scope.results.result[i].count === topscore){
         w.push($scope.results.result[i]);
      }
    }
    return w;
  }

  $scope.winners = $scope.getWinners();

  console.log($scope.winners);

}]);

app.controller('ProfileCtrl', [
'$scope',
'user',
function($scope, user){

  $scope.profile = user.data;


  console.log($scope.profile);

}]);
