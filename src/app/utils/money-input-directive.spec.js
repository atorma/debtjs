"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");

describe("Money input directive", function() {

  var inputElement, formElement;
  var form;
  var $scope;

  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", {});
  }));
  
  beforeEach(angular.mock.inject(function($rootScope, $compile) {
    $scope = $rootScope;
    $scope.value = undefined;

    formElement = $compile('<form name="form"><input money-input type="number" name="value" ng-model="value"/></form>')($scope);
    inputElement = formElement.find("input");
    form = $scope.form;
  }));
    
  it("formats model value with two decimals", function() {
    $scope.value = 3;
    $scope.$digest();
    expect(inputElement.val()).toEqual("3.00");

    $scope.value = -3.65;
    $scope.$digest();
    expect(inputElement.val()).toEqual("-3.65");
  });

  it("formats input value on blur", function() {
    form.value.$setViewValue("3.10");
    inputElement.triggerHandler("blur");
    expect($scope.value).toEqual(3.10);
    expect(inputElement.val()).toEqual("3.10");
  });

  it("formats undefined model value as empty", function() {
    $scope.value = undefined;
    $scope.$digest();
    expect(inputElement.val()).toEqual("");
  });

  it("formats undefined view value as empty", function() {
    $scope.value = 2.1;
    $scope.$digest();
    delete $scope.value;
    $scope.$digest();
    expect(inputElement.val()).toEqual("");
  });

  it("validates value with more than two decimals as invalid", function() {
    inputElement.val("-3.562");
    inputElement.triggerHandler("change");
    $scope.$digest();
    expect(inputElement.hasClass("ng-invalid") ).toBe(true);
  });
});