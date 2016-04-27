var app = angular.module('decisionMaker', ['ui.router', 'ng-sortable']);



app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

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

app.factory('auth', ['$http', '$window', function($http,$window){
    var auth = {};

    auth.saveToken = function(token) {
      $window.localStorage['usertoken'] = token;
    };

    auth.getToken = function(){
      return $window.localStorage['usertoken'];
    };

    auth.isLoggedIn = function(){
      var token = auth.getToken();
      if(token){
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    auth.currentUser = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.username;
      }
    };

    auth.register = function(user){
      return $http.post('/users/register', user).success(function(data){
        auth.saveToken(data.token);
      });
    };

    auth.logIn = function(user) {
      return $http.post('/' + user.name, user).success(function(data){
        auth.saveToken(data.token);
      });
    };

    auth.logOut = function() {
        $window.localStorage.removeItem('usertoken');
    };

    return auth;
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
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })

    $stateProvider
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
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

app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}]);

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

app.controller('MainCtrl', [
'$scope',
'rooms',
function($scope, rooms){
  $scope.rooms = rooms.rooms;
  $scope.options = ["",""];

  //Used for drag and drop
  $scope.barConfig = {
      animation: 150,
      //handle: ".handle",
      onSort: function (/** ngSortEvent */evt){
          // @see https://github.com/RubaXa/Sortable/blob/master/ng-sortable.js#L18-L24
      }
  };


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
