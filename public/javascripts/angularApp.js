var app = angular.module('decisionMaker', ['ui.router', 'ng-sortable']);



app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

app.factory('rooms', ['$http', 'auth', function($http, auth){
  var o = {
    rooms: []
  };

  o.getAll = function() {
    return $http.get('/rooms').success(function(data){
      angular.copy(data, o.rooms);
    });
  };

  o.create = function(room) {
    return $http.post('/rooms', room,{
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.rooms.push(data);
    });
  };

  o.get = function(id) {
    return $http.get('/rooms/' + id).then(function(res){
      return res.data;
    });
  };

  o.addVote = function(id, vote) {
    //console.log("id: " + id);
    //console.log("vote: " + vote);
    for(var i = 0; i < vote.length; i++){
      console.log(vote[i]);
    }
    return $http.post('/rooms/' + id + '/votes', {options: vote}, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  o.getResults = function(id) {
	return $http.get('/rooms/' + id + '/results').then(function(res){
		return res.data;
    });
  };

  o.addOptions = function(id, options){
	  return $http.post('/rooms/' + id + '/options', {options: options}).then(function(res){return res.data;});
  };


  return o;
}]);

app.factory('auth', ['$http', '$window', '$state', function($http,$window,$state){
    var auth = {};
    var profile = {
      user: {},
      created : [],
      voted: [],
      observe: []
    };

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
      return $http.post('/users/' + user.username, user).success(function(data){
        auth.saveToken(data.token);
      });
    };

    auth.logOut = function() {
        $window.localStorage.removeItem('usertoken');
        $state.go('login');
    };

    auth.getUser = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        return $http.get('/users/profile', {headers: {Authorization: 'Bearer '+auth.getToken()}}).success(function(data){
          profile.user = data.user;
          profile.created = data.created;
          profile.voted = data.voted;
          profile.observe = data.observe;
          return profile;
        });
      }
    };

    return auth;
}]);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('create', {
      url: '/create',
      templateUrl: '/create.html',
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
          $state.go('create');
        }
      }]
    })

    //will be a static page, no controller right now.
    $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html'
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
    .state('profile', {
      url: '/profile',
      templateUrl: '/profile.html',
      controller: 'ProfileCtrl',
      resolve: {
        user: ['$stateParams', 'auth', function($stateParams, auth) {
          return auth.getUser();
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
        }],
        user: ['$stateParams', 'auth', function($stateParams, auth) {
          return auth.getUser();
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
  //alert(user);
  for(var i = 0; i < user.data.voted.length; i++){
    if(user.data.voted[i]._id == $stateParams.id){
      $scope.message = "You have already voted in this poll. Voting again will update your previous vote";
    }
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
    console.log("original order")
    for (i = 0; i < room.options.length; i++){
      console.log(room.options[i].title);
    }
    var vote = angular.copy($scope.vote);
    console.log(vote);
    rooms.addVote(room._id, vote)
    .success(function(vote) {
      $scope.room.votes.push(vote);
    }).then(function(responce){
      $location.path('results/' + $stateParams.id);
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
    console.log($scope.user);
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('create');
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
'auth',
function($scope, rooms, auth){
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

  $scope.delete = function(i){
    if($scope.options.length < 3){
      return;
    }
    $scope.options.splice(i, 1);
  }

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
      votes: [],
      type: "FPP"
    });
    $scope.options = ["",""];
    $scope.title = "";
  };

  $scope.addOption = function(event){
      $scope.options.push("");
  };

}]);
