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
      },
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('login');
        }
      }]
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
      },
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('login');
        }
      }]
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
      },
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('login');
        }
      }]
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
      },
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('login');
        }
      }]
    });

  $urlRouterProvider.otherwise('home');
}]);
