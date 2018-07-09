"use strict";

var angular = require("angular");
var Decimal = require("simple-decimal-money");
var _ = require('lodash');

angular.module("debtApp")
  .directive("moneyInput", moneyInput);


function moneyInput($filter) {
  return {
    restrict: "A",
    require: "ngModel",
    link: link
  };

  function link($scope, iElem, iAttrs, ngModel) {
    ngModel.$validators.money = validateMoney;
    ngModel.$parsers.push(parseMoney);
    ngModel.$formatters.unshift(formatMoney);

    iElem.on("blur", handleBlur);
    ngModel.$render = render;

    function render() {
      if (ngModel.$valid) {
        iElem.val(formatMoney(ngModel.$modelValue));
      } else {
        iElem.val(ngModel.$viewValue);
      }
    }

    function handleBlur() {
      ngModel.$render();
    }
  }

  function validateMoney(value) {
    if (value < 0) {
      return false;
    } else {
      return true;
    }
  }

  function formatMoney(value) {
    if (_.isNil(value)) {
      return "";
    } else {
      return $filter("number")(value, 2);
    }
  }

  function parseMoney(value) {
    if (!_.isNumber(value) && _.isEmpty(value)) {
      return null;
    }
    return new Decimal(value).toNumber();
  }

}
