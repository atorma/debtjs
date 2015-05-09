"use strict";

var _ = require("lodash");
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
        
  });
  
  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", {});
  }));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope;
    
    controller = $controller("BalanceSheetSaveCtrl", {
      balanceSheetService: balanceSheetService,
      balanceSheetSaveCtrlConfig: {wait: 0},
      $scope: $rootScope
    });
    
  }));
  
  describe("save function", function() {
    
    it("saves balance sheet on scope digest", function(done) {
      $scope.$digest();
      
      afterTimeout(function() {
        expect(balanceSheetService.save).toHaveBeenCalled();
        done();
      });
      
    });
    
    it("displays error message if saving fails", function(done) {
      balanceSheetService.save.and.throwError("Some error");
      
      $scope.$digest();
      
      afterTimeout(function() {
        expect($scope.errorMessage).toEqual("Cannot save: Some error");
        done();
      });
      
    });
    
    it("clears error message if saving succeeds", function(done) {
      $scope.errorMessage = "Unable to save";
      
      $scope.$digest();
      
      afterTimeout(function() {
        expect($scope.errorMessage).toBe(undefined);
        done();
      });

    });
    
    function afterTimeout(fun) {
      setTimeout(fun, 0);
    }
    
  });

  
  
});

