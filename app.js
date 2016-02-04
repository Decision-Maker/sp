 
var app = angular.module('decisionMaker', []);


app.controller('MainCtrl', [
'$scope',
function($scope){
  $scope.options = [];
  $scope.posts = [];
  
  $scope.addPost = function(){
    if(!$scope.title || $scope.title === '') { return; }
    $scope.posts.push({
        title: $scope.title
    });
    $scope.title = '';
    var forms = document.getElementsByClassName("option");
    var length = forms.length;
    var seen = [];
    var valid = true;
    alert(length);
    
  };

  $scope.addOption = function(event, limit = false){
    if(limit || event.keyCode == 13){
        $scope.options.push({title: ""});
    }
  };
      
}]);