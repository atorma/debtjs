"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");

describe("Balance filter", function() {
  
  var balanceFilter;
    
  beforeEach(angular.mock.module("debtApp"));
  
  beforeEach(angular.mock.inject(function($filter) {
    
    balanceFilter = $filter("balance");
    
  }));
    
  it("for positive input returns value with + sign and two decimals", function() {
    expect(balanceFilter(12)).toBe("+12.00");
  });
  
  it("for negative input returns value with - sign and two decimals", function() {
    expect(balanceFilter(-12)).toBe("-12.00");
  });
  
  it("for zero input returns 0.00", function() {
    expect(balanceFilter(0)).toBe("0.00");
  });
  
  it("for other than number input returns the input", function() {
    expect(balanceFilter(undefined)).toBe(undefined);
    expect(balanceFilter("?")).toBe("?");
    expect(balanceFilter(NaN)).toBeNaN();
  });
  
});