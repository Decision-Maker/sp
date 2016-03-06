var app = angular.module('decisionMaker', ['ui.router', 'ng-sortable']);

app.factory('rooms', ['$http', function($http){
  var o = {
    rooms: []
  };

  o.getAll = function() {
    return $http.get('/rooms').success(function(data){
      angular.copy(data, o.rooms);
    });
  };

  o.create = function(room) {
    return $http.post('/rooms', room).success(function(data){
      o.rooms.push(data);
    });
  };

  o.get = function(id) {
    return $http.get('/rooms/' + id).then(function(res){
      return res.data;
    });
  };

  o.addVote = function(id, vote) {
    console.log("id: " + id);
    console.log("vote: " + vote);
    return $http.post('/rooms/' + id + '/votes', vote);
  };

  o.getResults = function(id) {
	return $http.get('/rooms/' + id + '/results').then(function(res){
		return res.data;
    })
  };

  return o;
}]);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        roomPromise: ['rooms', function(rooms){
          return rooms.getAll();
        }]
      }
    });

    $stateProvider
    .state('rooms', {
      url: '/rooms/{id}',
      templateUrl: '/rooms.html',
      controller: 'RoomsCtrl',
      resolve: {
        room: ['$stateParams', 'rooms', function($stateParams, rooms) {
          return rooms.get($stateParams.id);
        }]
      }
    });

    $stateProvider
    .state('results', {
      url: '/results/{id}',
      templateUrl: '/results.html',
      controller: 'ResultsCtrl',
      resolve: {
        room: ['$stateParams', 'rooms', function($stateParams, rooms) {
          return rooms.get($stateParams.id);
        }],
		results: ['$stateParams', 'rooms', function($stateParams, rooms) {
		  return rooms.getResults($stateParams.id);
		}]
      }
    });

  $urlRouterProvider.otherwise('home');
}]);

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

  $scope.results = results
  console.log(results);

}]);

app.controller('RoomsCtrl', [
'$scope',
'rooms',
'room',
function($scope, rooms, room){


  $scope.room = room;
  $scope.vote = angular.copy($scope.room.options);

  //Used for drag and drop
  $scope.barConfig = {
      animation: 150,
      //handle: ".handle",
      onSort: function (/** ngSortEvent */evt){
          // @see https://github.com/RubaXa/Sortable/blob/master/ng-sortable.js#L18-L24
      }
  };

  $scope.addVote = function(){
    console.log("original order")
    for (i = 0; i < room.options.length; i++){
      console.log(room.options[i].title);
    }
    var vote = angular.copy($scope.vote);
    console.log(vote);
    rooms.addVote(room._id, vote)
    .success(function(vote) {
      $scope.room.votes.push(vote);
    });
    //$scope.body = '';
  };

}]);

app.controller('MainCtrl', [
'$scope',
'rooms',
function($scope, rooms){
  $scope.rooms = rooms.rooms;
  $scope.options = ["",""];


  $scope.addRoom = function(){
    if(!$scope.title){
      return;
    }

    var uniqueOptions = $scope.options.filter(function(item, pos, self){
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

    rooms.create({
      title: $scope.title,
      options: uniqueOptions,
      votes: []
    });
    $scope.options = ["",""];
    $scope.title = "";
  };

  $scope.addOption = function(event){
      $scope.options.push("");
  };

}]);
