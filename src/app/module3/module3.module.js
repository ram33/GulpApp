'use strict';
angular.module('app.module3', []).config(function ($routeProvider) {
  $routeProvider.when('/module3', {
    templateUrl: 'module3/module3.tpl.html',
    controller: 'Module3Ctrl'
  });
})
  .run(function () {
    console.log('module3 loaded');
  });
