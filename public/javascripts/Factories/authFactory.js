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

    auth.validate = function(token){
      return $http.get('/users/validateToken', {headers: {Authorization: 'Bearer '+token}});
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
