app.controller('NavCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;

  $scope.loggedin = auth.isLoggedIn();

  if($scope.loggedin){
    auth.validate(auth.getToken()).success(function(data){
      if(!data.valid){
        auth.logOut();
        $state.go("login");
      }
    });
  }
}]);
