"use strict";

var angular = require("angular");
require("onsen");
var debtApp = angular.module("debtApp", ["onsen"]);

require("./layout");
require("./participants");
require("./expenses");

require("./dummy-service");
require("./dummy-controller");
