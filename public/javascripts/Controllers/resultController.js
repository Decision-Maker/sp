app.controller('ResultsCtrl', [
'$scope',
'rooms',
'room',
'results',
function($scope, rooms, room, results){

  $scope.room = room;
  //$scope.votes = angular.copy($scope.room.votes);
  //voteCount = $scope.votes.length;
  //finish = voteCount/2 + 1;

  $scope.results = results;
  console.log(results);

}]);

app.controller('ProfileCtrl', [
'$scope',
'user',
function($scope, user){

  $scope.profile = user.data;


  console.log($scope.profile);

}]);
