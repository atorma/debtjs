"use strict";

require("angular").module("debtApp")
  .controller("BalanceSheetWatchCtrl", BalanceSheetWatchCtrl);

function BalanceSheetWatchCtrl(balanceSheetService, $scope, $log) {
  
  this.init = init;
  
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    $scope.balanceSheet = balanceSheetService.balanceSheet;
    $scope.$watch("balanceSheet.name", save);
    $scope.$watch("balanceSheet.persons", save, true);
    $scope.$watch("balanceSheet.expenses", save, true);
    $scope.$watch("balanceSheet.participations", save, true);
  };
  
  function save() {
    balanceSheetService.save();
    $log.debug("Balance sheet saved");
  }
 
}