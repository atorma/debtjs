"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
  
describe("BalanceSheetSaveCtrl", function() {

  var $scope; 
  var $state;
  var $timeout;
  var balanceSheetService;
  var controller;

  beforeEach(angular.mock.module("debtApp"));
  
  beforeEach(function() {
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["save"]);
    
    $timeout = function(command) {
      command();
    };
    
  });
  
  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", {});
  }));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope;
    
    controller = $controller("BalanceSheetSaveCtrl", {
      balanceSheetService: balanceSheetService,
      $scope: $rootScope,
      $timeout: $timeout
    });
    
  }));
  

  it("saves balance sheet on scope digest", function() {
    $scope.$digest();
    expect(balanceSheetService.save).toHaveBeenCalled();
  });
  
});

