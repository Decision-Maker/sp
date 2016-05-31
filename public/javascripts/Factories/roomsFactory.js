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
