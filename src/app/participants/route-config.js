require("angular").module("debtApp")
  .config(config);
  
function config($stateProvider) {

	$stateProvider
		.state("participantList", {
			url: "/participants",
			templateUrl: "participants/participant-list.html",
			controller: "ParticipantListCtrl",
			resolve: {
			  balanceSheet: function(balanceSheetService) {
			    return balanceSheetService.balanceSheet;
			  }
			}
		})
		.state("participantDetail", {
			url: "/participants/:id",
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