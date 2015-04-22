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
  
  describe("save function", function() {
    
    it("saves balance sheet on scope digest", function() {
      $scope.$digest();
      
      expect(balanceSheetService.save).toHaveBeenCalled();
    });
    
    it("displays error message if saving fails", function() {
      balanceSheetService.save.and.throwError("Some error");
      
      $scope.$digest();
      
      expect($scope.errorMessage).toEqual("Cannot save: Some error");
    });
    
    it("clears error message if saving succeeds", function() {
      $scope.errorMessage = "Unable to save";
      
      $scope.$digest();
      
      expect($scope.errorMessage).toBe(undefined);
    });
    
    
  });

  
  
});

