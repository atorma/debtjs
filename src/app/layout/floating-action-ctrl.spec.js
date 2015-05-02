"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
  
describe("FloatingActionCtrl", function() {
  
  var vm;
  
  var $scope, $q;
  
  var balanceSheetService;
  var openCreatePersonDialog;
  
  beforeEach(function() {
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["createPerson", "createExpense"]);

    openCreatePersonDialog = jasmine.createSpy("openCreatePersonDialog");
  });

  
  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", {});
  }));
  
  
  beforeEach(angular.mock.inject(function($rootScope, $controller, _$q_) {
    
    $scope = $rootScope;
    $q = _$q_;
    
    vm = $controller("FloatingActionCtrl", {
      balanceSheetService: balanceSheetService,
      openCreatePersonDialog: openCreatePersonDialog
    });
    
  }));

  it("creates person using options from dialog", function() {
    var personOptions = {name: "Anssi"};
    openCreatePersonDialog.and.returnValue($q.when(personOptions));
    
    vm.createPerson();
    $scope.$digest();
    
    expect(balanceSheetService.createPerson).toHaveBeenCalledWith(personOptions);
  });

});

