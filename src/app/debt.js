"use strict";

var angular = require("angular");
require("angular-material");
require("angular-animate");
require("angular-aria");
require("angular-route");
require("angular-ui-router");

angular.module("debtApp", ["ngMaterial", "ui.router"]);

require("./layout");
require("./state");
require("./participants");
require("./expenses");

require("./dummy-service");
require("./dummy-controller");