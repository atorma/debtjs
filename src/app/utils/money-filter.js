"use strict";

var angular = require("angular");

angular.module("debtApp")
  .filter("money", money);


function money($filter) {
  return function money(value) {
    return $filter("number")(value, "2");
  };
}