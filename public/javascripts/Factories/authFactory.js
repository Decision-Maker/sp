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
