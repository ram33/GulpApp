'use strict';
angular.module('app.module1', [])
  .config(function ($routeProvider) {
    $routeProvider.when('/module1', {
      templateUrl: 'module1/module1.tpl.html',
      controller: 'Module1Ctrl'
    });
  })
  .run(function () {
    console.log('module1 loaded1');
  });
