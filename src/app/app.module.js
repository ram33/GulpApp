'use strict';
angular.module('app', ['ngRoute', 'app.core', 'nav.module', 'app.module1', 'app.module2', 'app.module3'])
  .config(function ($routeProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/module1'
      });
  })
  .run(function ($http) {
    console.log('main module loaded');
  });

angular.module('app.core', []);