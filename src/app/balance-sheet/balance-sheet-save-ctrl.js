"use strict";

var _ = require("lodash"); 

require("angular").module("debtApp")
  .value("balanceSheetSaveCtrlConfig", {wait: 500})
  .controller("BalanceSheetSaveCtrl", BalanceSheetSaveCtrl);

function BalanceSheetSaveCtrl(balanceSheetService, balanceSheetSaveCtrlConfig, $scope, $log) {
  
  this.init = init;
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    
    var debouncedSave = _.debounce(tryToSave, balanceSheetSaveCtrlConfig.wait);
    $scope.$watch(debouncedSave);
    
  }

  function tryToSave() {
    try {
      balanceSheetService.save();
      $scope.errorMessage = undefined;
      $log.debug("Balance sheet saved");
    } catch (e) {
      $scope.errorMessage = "Cannot save: " + e.message;
      $log.error("Error when saving balance sheet: " + e.message);
    }
  }
 
}