"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
  
describe("FloatingActionCtrl", function() {
  
  var vm;
  
  var $scope, $q;
  
  var balanceSheetService;
  var balanceSheet;
  var openCreatePersonDialog;
  var openCreateExpenseDialog;
  
  beforeEach(function() {
    balanceSheet = jasmine.createSpyObj("balanceSheet", ["createPerson", "createExpense"]);
    
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["dummy"]);
    balanceSheetService.balanceSheet = balanceSheet;

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
    
    expect(balanceSheet.createPerson).toHaveBeenCalledWith(dialogResult.person, dialogResult.options);
  });
  
  it("creates expense using data and options from dialog", function() {
    var dialogResult = {
        expense: {name: "Stuff", sharing: "equal"},
        options: {createParticipations: true}
    };
    openCreateExpenseDialog.and.returnValue($q.when(dialogResult));
    
    vm.createExpense();
    $scope.$digest();
    
    expect(balanceSheet.createExpense).toHaveBeenCalledWith(dialogResult.expense, dialogResult.options);
  });

});

