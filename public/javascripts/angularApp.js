
var app = angular.module('decisionMaker', ['ui.router', 'ng-sortable']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl'
    });

    $stateProvider
    .state('vote', {
      url: '/vote/{id}',
      templateUrl: '/vote.html',
      controller: 'VoteCtrl'
    });

    $stateProvider
    .state('result', {
      url: '/result/{id}',
      templateUrl: '/result.html',
      controller: 'ResultCtrl'
    });

  $urlRouterProvider.otherwise('home');
}]);

app.factory('room', [function(){
  var o = {
    rooms: []
  };
  return o;
}]);

//we should eventually have our controllers not have alot of code, but just install funcitons from factorys and services
app.controller('MainCtrl', [
'$scope',
'room',
function($scope, room){
  $scope.rooms = room.rooms;
  $scope.options = [];

  $scope.barConfig = {
      animation: 150,
      onSort: function (/** ngSortEvent */evt){
          // @see https://github.com/RubaXa/Sortable/blob/master/ng-sortable.js#L18-L24
      }
  };


  $scope.addRoom = function(){
    if(!$scope.title || $scope.title === '') { return; }

    //var forms = document.getElementsByClassName("option");
    //var length = forms.length;
    //var seen = [];
    //var valid = true;
    var uniqueOptions = $scope.options.filter(function(item, pos, self){
      for(i = pos + 1; i < self.length; i++){
        if(self[i].name == item.name){
          return false;
        }
      }
      return true;
    });

    /*for(option in $scope.options){

    }*/

    /*r = []
    for (i = 0; i < length; i++){
      r.push(forms[i].value)
    }*/

    //alert(uniqueOptions);
    $scope.rooms.push(
      {
        title: $scope.title,
        options: uniqueOptions
      }
    );
    $scope.title = '';
    $scope.options = [];
  };

  $scope.addOption = function(event, limit = false){
    //alert(event.keyCode);
    if(limit || event.keyCode == 13){
        $scope.options.push({name: "", count: 0});
    }
  };

  /*$scope.foo = function(){
    var j = ['','a','b','c'];
    var k = [];
    for(i in j){
      k.push(j[i]);
    }
    alert(k);

  };*/

}]);

app.controller('VoteCtrl', [
'$scope',
'$stateParams',
'room',
function($scope, $stateParams, room){
  $scope.room = room.rooms[$stateParams.id];

  $scope.incrementVote = function(option){
    option.count++;
  }
}]);

app.controller('ResultCtrl', [
'$scope',
'$stateParams',
'room',
function($scope, $stateParams, room){
  $scope.room = room.rooms[$stateParams.id];
}]);
