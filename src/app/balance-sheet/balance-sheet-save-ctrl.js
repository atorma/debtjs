"use strict";

require("angular").module("debtApp")
  .controller("BalanceSheetSaveCtrl", BalanceSheetSaveCtrl);

function BalanceSheetSaveCtrl(balanceSheetService, $scope, $log, $timeout) {
  
  this.init = init;
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    
    var timeoutPromise = null;
    $scope.$watch(function() {
      if (timeoutPromise === null) {
        timeoutPromise = $timeout(function() {
          tryToSave();
          timeoutPromise = null;
        }, 0, false);
      }
    });
    
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