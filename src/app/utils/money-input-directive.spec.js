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

    formElement = $compile('<form name="form"><input money-input type="text" name="value" ng-model="value"/></form>')($scope);
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

  it("formats model value with thousand separator", function() {
    $scope.value = 1500;
    $scope.$digest();
    expect(inputElement.val()).toEqual("1,500.00");
  });

  it("parses and formats input value on blur", function() {
    form.value.$setViewValue("3.10");
    inputElement.triggerHandler("blur");
    expect($scope.value).toEqual(3.10);
    expect(inputElement.val()).toEqual("3.10");
  });

  it("correctly parses view values >= 1000", function() {
    form.value.$setViewValue("1500");
    inputElement.triggerHandler("blur");
    expect($scope.value).toEqual(1500);
    expect(inputElement.val()).toEqual("1,500.00");
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

  it("parses input with two decimals", function() {
    form.value.$setViewValue("3.1051");
    inputElement.triggerHandler("blur");
    expect($scope.value).toEqual(3.11);
    expect(inputElement.val()).toEqual("3.11");
  });

  it("parses empty string as null", function() {
    form.value.$setViewValue("");
    inputElement.triggerHandler("blur");
    expect($scope.value).toEqual(null);
    expect(inputElement.val()).toEqual("");
  });

  it("validates negative value as invalid and retains invalid view value", function() {
    form.value.$setViewValue("42");
    inputElement.triggerHandler("blur");
    expect($scope.value).toEqual(42);
    expect(inputElement.hasClass("ng-invalid")).toEqual(false);

    form.value.$setViewValue(undefined);
    inputElement.triggerHandler("blur");
    expect($scope.value).toEqual(undefined);
    expect(inputElement.hasClass("ng-invalid")).toEqual(false);

    form.value.$setViewValue("-5");
    inputElement.triggerHandler("blur");
    expect($scope.value).toEqual(undefined);
    expect(inputElement.hasClass("ng-invalid")).toEqual(true);
    expect(inputElement.val()).toEqual("-5");
  });
});