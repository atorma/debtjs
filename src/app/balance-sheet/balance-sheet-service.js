"use strict";

var _ = require("lodash");
var angular = require("angular");
var BalanceSheet = require('./balance-sheet');

angular.module("debtApp")
.factory("balanceSheetService", balanceSheetService);

function balanceSheetService(localStorageService) {
  
  var service = {
    balanceSheet: undefined,
    error: undefined,
    save: save,
    loadFromJson: loadFromJson,
    exportToJson: exportToJson,
    createNew: createNew,
    init: init
  };
  service.init();
  
  return service;
  
  
  function init() {
    var data = localStorageService.get("balanceSheetData");
    try {
      service.balanceSheet = new BalanceSheet(data);
      service.error = undefined;
    } catch (e) {
      service.error = e;
    }
  }

  function save() {
    if (!service.balanceSheet) {
      throw service.error;
    }

    try {
      service.balanceSheet.throwErrorIfInvalid();
    } catch (e) {
      service.error = e;
      throw e;
    }

    localStorageService.set("balanceSheetData", service.balanceSheet.exportData());
    service.error = undefined;
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

  function createNew() {
    service.balanceSheet = new BalanceSheet();
    service.save();
  }

}


