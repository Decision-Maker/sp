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

app.controller('MainCtrl', [
'$scope',
'$state',
'rooms',
'auth',
function($scope, $state, rooms, auth){
  $scope.rooms = rooms.rooms;
  $scope.options = ["",""];

  $scope.type = "FPP";
  $scope.error = "";

  //Used for drag and drop
  $scope.barConfig = {
      animation: 150,
      //handle: ".handle",
      onSort: function (/** ngSortEvent */evt){
          // @see https://github.com/RubaXa/Sortable/blob/master/ng-sortable.js#L18-L24
      }
  };

  $scope.changeType = function(type){
    $scope.type = type;
  }

  $scope.delete = function(i){
    if($scope.options.length < 3){
      return;
    }
    $scope.options.splice(i, 1);
  }

  $scope.addRoom = function(){
    if(!$scope.title){
      $scope.error = "Please Enter a Title";
      return;
    }

    var uniqueOptions = $scope.options.filter(function(item, pos, self){
      if(item === ""){
        return false;
      }
      for(i = pos + 1; i < self.length; i++){
        if(self[i] === item){
          return false;
        }
      }
      return true;
    });

    if(uniqueOptions.length <= 1){
      $scope.error = "Please Provide Atleast 2 Unique Options"
      return;
    }

    rooms.create({
      title: $scope.title,
      options: uniqueOptions,
      votes: [],
      type: $scope.type,
      state: "options",
    })
    .success(function(data){
      $state.go("rooms", {"id": data._id})
    });
  };

  $scope.addOption = function(event){
      $scope.options.push("");
  };

}]);
