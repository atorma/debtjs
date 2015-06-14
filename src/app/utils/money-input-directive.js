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
    ngModel.$validators.money = validateTwoDecimals;
    ngModel.$formatters.unshift(formatMoney);
    iElem.on("blur", function() {
      ngModel.$render();
    });
    ngModel.$render = function() {
      iElem.val(formatMoney(ngModel.$modelValue));
    };
  }

  function formatMoney(value) {
    return $filter("number")(value, 2);
  }

  function validateTwoDecimals(value) {
    if (!value) {
      return true;
    } else {
      var roundedValue = new Decimal(value).toNumber();
      return roundedValue === value;
    }
  }

}
