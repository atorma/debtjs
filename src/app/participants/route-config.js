"use strict";

require("angular").module("debtApp")
  .config(config);

function config($stateProvider) {

  $stateProvider
    .state("people", {
      url: "/people",
      views: {
        "main": {
          templateUrl: "participants/participant-list.html",
          controller: "ParticipantListCtrl",
        }
      },
      resolve: {
        balanceSheet: function(balanceSheetService) {
          return balanceSheetService.balanceSheet;
        }
      }
    })
    .state("people.detail", {
      url: "/:id",
      views: {
        "main": {
          templateUrl: "participants/participant-detail.html",
          controller: "ParticipantDetailCtrl"
        }
      }
    })
    ;
}