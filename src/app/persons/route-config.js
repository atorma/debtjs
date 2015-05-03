"use strict";

require("angular").module("debtApp")
  .config(config);

function config($stateProvider) {

  $stateProvider
    .state("person", {
      url: "/persons/:id",
      templateUrl: "persons/person-detail.html",
      controller: "PersonDetailCtrl as vm"
    })
    ;
}