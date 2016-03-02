
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

  //The room starts with 2 blank options
  $scope.options.push(
    {name: "", count: 0},
    {name: "", count: 0}
  );

  //Used for drag and drop
  $scope.barConfig = {
      animation: 150,
      //handle: ".handle",
      onSort: function (/** ngSortEvent */evt){
          // @see https://github.com/RubaXa/Sortable/blob/master/ng-sortable.js#L18-L24
      }
  };

  //Used to remove options from scope.options
  $scope.toggleHandle = function(repeatScope) {
    console.log("hello");
  }

  //Used to remove options from scope.options
  $scope.remove = function(item) {
    if($scope.options.length <= 2){
      return
    }
    var index = $scope.options.indexOf(item);
    $scope.options.splice(index, 1);
  }


  $scope.addRoom = function(){
    if(!$scope.title || $scope.title === '') { return; }

    //var forms = document.getElementsByClassName("option");
    //var length = forms.length;
    //var seen = [];
    //var valid = true;
    var uniqueOptions = $scope.options.filter(function(item, pos, self){
      if(item.name == ""){
        return false;
      }
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

/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 *
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );
