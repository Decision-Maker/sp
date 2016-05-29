app.controller('MainCtrl', [
'$scope',
'rooms',
'auth',
function($scope, rooms, auth){
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
      type: $scope.type
    });
    $scope.options = ["",""];
    $scope.title = "";
  };

  $scope.addOption = function(event){
      $scope.options.push("");
  };

}]);
