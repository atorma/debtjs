require("angular").module("debtApp")
	.factory("dummyService", dummyService);

function dummyService($http) {
	return {
		getHesari: function() {
			return $http.get("http://www.hs.fi");
		}
	};
}
