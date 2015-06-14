"use strict";

var angular = require("angular");
var _ = require("lodash");
var Decimal = require("simple-decimal-money");

angular.module("debtApp")
  .directive("moneyInput", moneyInput);


function moneyInput($filter) {
  return {
    restrict: "A",
    require: "ngModel",
    link: link
  };

  function link($scope, iElem, iAttrs, ngModel) {
    ngModel.$parsers.push(parseMoney);
    ngModel.$formatters.unshift(formatMoney);
    iElem.on("blur", function() {
      ngModel.$render();
    });
    ngModel.$render = function() {
      iElem.val(formatMoney(ngModel.$modelValue));
    };
  }

  function formatMoney(value) {
    if (value === undefined || value === null) {
      return "";
    } else {
      return $filter("number")(value, 2);
    }
  }

  function parseMoney(value) {
    return new Decimal(value).toNumber();
  }

}
