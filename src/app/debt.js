"use strict";

var angular = require("angular");
require("onsen");

angular.module("debtApp", ["onsen"]);

require("./state");
require("./participants");
require("./expenses");

require("./dummy-service");
require("./dummy-controller");
