"use strict";

require("angular").module("debtApp")
  .config(config);

function config($stateProvider) {

  $stateProvider
    .state("persons", {
      url: "/persons",
      views: {
        "main": {
          templateUrl: "persons/person-list.html",
          controller: "PersonListCtrl",
        }
      },
      resolve: {
        balanceSheet: function(balanceSheetService) {
          return balanceSheetService.balanceSheet;
        }
      }
    })
    .state("persons.detail", {
      url: "/:id",
      views: {
        "main": {
          templateUrl: "persons/person-detail.html",
          controller: "PersonDetailCtrl"
        }
      }
    })
    ;
}