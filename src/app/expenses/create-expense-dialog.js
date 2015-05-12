"use strict";

var angular = require("angular");

angular.module("debtApp")
.factory("openCreateExpenseDialog", openCreateExpenseDialog);


function openCreateExpenseDialog($mdDialog) {
  
  return open;
  
  function open() {
    return $mdDialog.show({
      templateUrl: "expenses/create-expense-dialog.html",
      controller: DialogController,
      controllerAs: "vm"
    });
  }
  
}

function DialogController($mdDialog) {
  var vm = this;
  
  vm.ok = ok;
  vm.cancel = cancel;
  vm.init = init;
  
  init();
  
  
  function init() {
    vm.expense = {
      name: undefined,
      sharing: "equal"
    };
    vm.options = {
      createParticipations: true
    };
  }

  function ok() {
    $mdDialog.hide({expense: vm.expense, options: vm.options});
  }
  
  function cancel() {
    $mdDialog.cancel();
  }
}