"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");

describe("Money input directive", function() {

  var inputElement;
  var $scope;

  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", {});
  }));
  
  beforeEach(angular.mock.inject(function($rootScope, $compile) {
    $scope = $rootScope;
    $scope.value = undefined;

    inputElement = $compile('<input money-input type="number" ng-model="value"/>')($scope);
  }));
    
  it("formats model value with two decimals", function() {
    $scope.value = 3;
    $scope.$digest();
    expect(inputElement.val()).toEqual("3.00");

    $scope.value = -3.65;
    $scope.$digest();
    expect(inputElement.val()).toEqual("-3.65");
  });

  it("validates value with more than two decimals as invalid", function() {
    inputElement.val("-3.562");
    inputElement.triggerHandler("change");
    $scope.$digest();
    expect(inputElement.hasClass("ng-invalid") ).toBe(true);
  });
});