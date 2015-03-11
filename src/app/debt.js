"use strict";

var angular = require("angular");
require("angular-material");
require("angular-animate");
require("angular-aria");

angular.module("debtApp", ["ngMaterial"]);

require("./state");
require("./participants");
require("./expenses");

require("./dummy-service");
require("./dummy-controller");
