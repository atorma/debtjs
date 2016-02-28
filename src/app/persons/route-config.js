"use strict";

var angular = require("angular");

angular.module("debtApp")
  .config(config);

function config($stateProvider) {
  $stateProvider
    .state("person", {
      url: "/persons/:id",
      views: {
        "": {
          templateUrl: "persons/person-detail.html",
          controller: "PersonDetailCtrl as vm"
        },
        "floatingButton": {
          templateUrl: "persons/floating-button.html"
        }
      }

    });
}