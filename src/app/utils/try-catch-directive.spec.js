"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");

describe("Try-catch directive", function() {

  var $scope, $compile;

  beforeEach(angular.mock.module("debtApp"));

  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", {});
  }));

  beforeEach(angular.mock.inject(function($rootScope, _$compile_) {
    $scope = $rootScope;
    $compile = _$compile_;
  }));

  it("outputs the result of the given expression if it evaluates successfully", function() {
    $scope.myFunction = function() {
      return "WOO";
    };
    var directiveEl = $compile('<try-catch expression="myFunction()">')($scope);
    $scope.$digest();

    expect(directiveEl.text()).toEqual("WOO");
  });

  it("outputs the result of the given expression that has parameters if it evaluates successfully", function() {
    $scope.myFunction = function(value) {
      return value;
    };
    $scope.myParam = "WOO";
    var directiveEl = $compile('<try-catch expression="myFunction(myParam)">')($scope);
    $scope.$digest();

    expect(directiveEl.text()).toEqual("WOO");
  });

  it("outputs the error result if the given expression throws an error", function() {
    $scope.myFunction = function() {
      throw new Error("Failure");
    };
    $scope.errorResult = "HUH?";
    var directiveEl = $compile('<try-catch expression="myFunction()" error-result="{{errorResult}}">')($scope);
    $scope.$digest();


    expect(directiveEl.text()).toEqual("HUH?");
  });

});