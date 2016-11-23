"use strict";

var angular = require("angular");
var personDetailTpl = require("./person-detail.html");
var floatingButtonTpl = require("./floating-button.html");

angular.module("debtApp")
  .config(config);

function config($stateProvider) {
  $stateProvider
    .state("person", {
      url: "/persons/:id",
      views: {
        "": {
          templateUrl: personDetailTpl,
          controller: "PersonDetailCtrl as vm"
        },
        "floatingButton": {
          templateUrl: floatingButtonTpl
        }
      }

    });
}