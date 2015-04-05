"use strict";

var angular = require("angular");
var BalanceSheet = require('./balance-sheet');

angular.module("debtApp")
.factory("balanceSheetService", balanceSheetService);

function balanceSheetService(localStorageService) {
  
  var service = {
    balanceSheet: null,
    save: save,
    loadFromJson: loadFromJson,
    exportToJson: exportToJson,
    init: init
  };
  service.init();
  
  return service;
  
  
  function init() {
    var data = localStorageService.get("balanceSheetData");
    service.balanceSheet = new BalanceSheet(data); 
  }

  function save() {
    localStorageService.set("balanceSheetData", service.balanceSheet.exportData());
  }
  
  function loadFromJson(json) {
    var data = angular.fromJson(json);
    service.balanceSheet = new BalanceSheet(data); 
    save();
  }
  
  function exportToJson() {
    var data = service.balanceSheet.exportData(); 
    return angular.toJson(data);
  }
}


