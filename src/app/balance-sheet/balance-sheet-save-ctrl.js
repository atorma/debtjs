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
          balanceSheetService.save();
          $log.debug("Balance sheet saved");
          timeoutPromise = null;
        }, 0, false);
      }
    });
    
  };

 
}