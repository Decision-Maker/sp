
var app = angular.module('decisionMaker', []);



app.factory('room', [function(){
  var o = {
    rooms: []
  };
  return o;
}])

app.controller('MainCtrl', [
'$scope',
'room',
function($scope, room){
  $scope.rooms = room.rooms;
  $scope.options = []

  $scope.addRoom = function(){
    if(!$scope.title || $scope.title === '') { return; }

    var forms = document.getElementsByClassName("option");
    var length = forms.length;
    var seen = [];
    var valid = true;
    r = []
    for (i = 0; i < length; i++){
      r.push(forms[i].value)
    }

    alert(r)
    $scope.rooms.push(
      {
        title: $scope.title,
        options: r
      }
    );
    $scope.title = '';
  };

  $scope.addOption = function(event, limit = false){
    if(limit || event.keyCode == 13){
        $scope.options.push({title: ""});
    }
  };

}]);
