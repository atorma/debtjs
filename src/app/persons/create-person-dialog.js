"use strict";

require("angular").module("debtApp")
.factory("openCreatePersonDialog", openCreatePersonDialog);


function openCreatePersonDialog($mdDialog) {
  
  return open;
  
  function open() {
    return $mdDialog.show({
      templateUrl: "persons/create-person-dialog.html",
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
    vm.options = {
      person: {
          name: undefined
      },
      createParticipations: true
    };
  }

  function ok() {
    $mdDialog.hide(vm.options);
  }
  
  function cancel() {
    $mdDialog.cancel();
  }
}