"use strict";

var angular = require("angular");
var _ = require('lodash');

angular.module("debtApp")
  .filter("money", money);


function money($filter) {
  return function money(value) {
    return $filter("number")(value, "2");
  };
}