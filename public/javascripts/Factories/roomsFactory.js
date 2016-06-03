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
    });
  };

  o.get = function(id) {
    return $http.get('/rooms/' + id).then(function(res){
      return res.data;
    });
  };

  o.addVote = function(id, vote) {
    for(var i = 0; i < vote.length; i++){
      console.log(vote[i]);
    }
    return $http.post('/rooms/' + id + '/votes', vote, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  o.getResults = function(id) {
	return $http.get('/rooms/' + id + '/results').then(function(res){
		return res.data;
    });
  };

  o.addOptions = function(id, options){
    console.log('adding Options');
    console.log(id, options);
	  return $http.post('/rooms/' + id + '/options', {options: options});
  };

  o.changeState = function(room){
    return $http.post('/rooms/' + room._id + '/statechange', room, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  }


  return o;
}]);
