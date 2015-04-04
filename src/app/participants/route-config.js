"use strict";

require("angular").module("debtApp")
  .config(config);
  
function config($stateProvider) {

	$stateProvider
		.state("participantList", {
			url: "/people",
			templateUrl: "participants/participant-list.html",
			controller: "ParticipantListCtrl",
			resolve: {
			  balanceSheet: function(balanceSheetService) {
			    return balanceSheetService.balanceSheet;
			  }
			}
		})
		.state("participantDetail", {
			url: "/people/:id",
			templateUrl: "participants/participant-detail.html",
			controller: "ParticipantDetailCtrl",
			resolve: {
        balanceSheet: function(balanceSheetService) {
          return balanceSheetService.balanceSheet;
        }
      }
		})
		;
}