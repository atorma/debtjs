"use strict";

var angular = require("angular");
var _ = require('lodash');

angular.module("debtApp")
  .filter("balance", balance);


function balance($filter) {
  return function balance(value) {
    if (value > 0) {
      return "+" + $filter("number")(value, "2");
    } else if (value <= 0) {
      return $filter("number")(value, "2");
    } else {
      return undefined;
    }
  };
}