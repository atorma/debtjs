"use strict";

require("angular").module("debtApp")
  .controller("ToolbarCtrl", ToolbarCtrl);

function ToolbarCtrl($scope, $mdSidenav) {
  var vm = this;
  
  vm.mainMenu = {
    toggle: toggleMenu  
  };
  
  
  function toggleMenu() {
    $mdSidenav("main-menu").toggle();
  }
  
}