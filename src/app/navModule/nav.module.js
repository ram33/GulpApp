'use strict';
angular.module('nav.module', [])
  .controller('NavCtrl', function ($location, $scope) {
    $scope.isActive = function(path){
      return $location.path().substr(1) === path;
    };
  });
