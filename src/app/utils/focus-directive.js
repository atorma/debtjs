"use strict";

var angular = require("angular");

angular.module("debtApp")
  .directive("focus", focus);


function focus($timeout) {
  return {
    restrict: "A",
    link: function($scope, iElem) {
      $timeout(function() {
        iElem[0].focus();
      }, 0);
    }
  };
}