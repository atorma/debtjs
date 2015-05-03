"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
  
describe("FloatingActionCtrl", function() {
  
  var vm;
  
  var $scope, $q;
  
  var balanceSheetService;
  var openCreatePersonDialog;
  var openCreateExpenseDialog;
  
  beforeEach(function() {
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["createPerson", "createExpense"]);

    openCreatePersonDialog = jasmine.createSpy("openCreatePersonDialog");
    openCreateExpenseDialog = jasmine.createSpy("openCreateExpenseDialog");
  });

  
  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", {});
  }));
  
  
  beforeEach(angular.mock.inject(function($rootScope, $controller, _$q_) {
    
    $scope = $rootScope;
    $q = _$q_;
    
    vm = $controller("FloatingActionCtrl", {
      balanceSheetService: balanceSheetService,
      openCreatePersonDialog: openCreatePersonDialog,
      openCreateExpenseDialog: openCreateExpenseDialog
    });
    
  }));

  it("creates person using data and options from dialog", function() {
    var dialogResult = {
        person: {name: "Anssi"},
        options: {createParticipations: true}
    };
    openCreatePersonDialog.and.returnValue($q.when(dialogResult));
    
    vm.createPerson();
    $scope.$digest();
    
    expect(balanceSheetService.createPerson).toHaveBeenCalledWith(dialogResult.person, dialogResult.options);
  });
  
  it("creates expense using data and options from dialog", function() {
    var dialogResult = {
        expense: {name: "Stuff", sharing: "equal"},
        options: {createParticipations: true}
    };
    openCreateExpenseDialog.and.returnValue($q.when(dialogResult));
    
    vm.createExpense();
    $scope.$digest();
    
    expect(balanceSheetService.createExpense).toHaveBeenCalledWith(dialogResult.expense, dialogResult.options);
  });

});

