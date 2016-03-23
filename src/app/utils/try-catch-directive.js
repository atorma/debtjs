"use strict";

var angular = require("angular");

angular.module("debtApp")
  .directive("tryCatch", tryCatch);

function tryCatch() {
  return {
    scope: {
      expression: "&",
      errorResult: "@"
    },
    template: '{{result}}',
    link: link
  };

  function link($scope) {
    try {
      $scope.result = $scope.expression();
    } catch (e) {
      $scope.result = $scope.errorResult;
    }
  }
}