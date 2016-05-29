var app = angular.module('decisionMaker', ['ui.router', 'ng-sortable']);

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('create', {
      url: '/create',
      templateUrl: 'templates/create.html',
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
      templateUrl: 'templates/login.html',
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
      templateUrl: 'templates/home.html'
    })

    $stateProvider
    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html',
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
      templateUrl: 'templates/profile.html',
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
      templateUrl: 'templates/rooms.html',
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
      templateUrl: 'templates/results.html',
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
