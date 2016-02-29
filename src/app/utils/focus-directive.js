"use strict";

var angular = require("angular");

angular.module("debtApp")
  .directive("focus", focus);


function focus($timeout) {
  return {
    restrict: "A",
    link: function($scope, iElem, iAttrs) {
      var focusExpr = iAttrs.focus || 'true';
      $timeout(function() {
        var shouldFocus = $scope.$eval(focusExpr);
        if (shouldFocus) {
          iElem[0].focus();
        }
      }, 0);
    }
  };
}