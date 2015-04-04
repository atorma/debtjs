"use strict";

var angular = require("angular");
require("angular-material");
require("angular-animate");
require("angular-aria");
require("angular-route");
require("angular-ui-router");

angular.module("debtApp", ["ngMaterial", "ui.router"]);

require("./route-config");
require("./debts");
require("./balance-sheet");
require("./participants");
require("./expenses");