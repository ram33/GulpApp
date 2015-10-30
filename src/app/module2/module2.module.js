'use strict';
angular.module('app.module2', [])
  .config(function ($routeProvider) {
    $routeProvider.when('/module2', {
      templateUrl: 'module2/module2.tpl.html',
      controller: 'Module2Ctrl'
    });
  })
  .run(function () {
    console.log('module2 loaded');
  });
