"use strict";

var angular = require("angular");
var createPersonDialogTpl = require("./create-person-dialog.html");

angular.module("debtApp")
.factory("openCreatePersonDialog", openCreatePersonDialog);


function openCreatePersonDialog($mdDialog) {
  
  return open;
  
  function open() {
    return $mdDialog.show({
      templateUrl: createPersonDialogTpl,
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
    vm.person = {
      name: undefined
    };
    vm.options = {
      createParticipations: true
    };
  }

  function ok() {
    $mdDialog.hide({person: vm.person, options: vm.options});
  }
  
  function cancel() {
    $mdDialog.cancel();
  }
}