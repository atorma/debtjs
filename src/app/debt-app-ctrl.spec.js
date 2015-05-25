"use strict";

var _ = require("lodash");
var angular = require("angular");
require("angular-mocks/ngMock");
require("./debt-app-ctrl");
  
describe("DebtAppCtrl", function() {
  
  var vm;

  var events;
  var $scope; 
  var $state;
  var $q;
  var balanceSheetService;
  var balanceSheet;
  var openCreatePersonDialog;
  var openCreateExpenseDialog;
  

  beforeEach(angular.mock.module("debtApp"));
  
  
  beforeEach(function() {
    balanceSheet = jasmine.createSpyObj("balanceSheet", ["createPerson", "createExpense"]);
    
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["save", "createNew"]);
    balanceSheetService.balanceSheet = balanceSheet;

    openCreatePersonDialog = jasmine.createSpy("openCreatePersonDialog");
    openCreateExpenseDialog = jasmine.createSpy("openCreateExpenseDialog");

    $state = jasmine.createSpyObj("$state", ["go"]);
  });
  
  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", $state);
  }));

  
  beforeEach(angular.mock.inject(function(_events_, $rootScope, $controller, _$q_, $mdDialog) {
    events = _events_;
    $q = _$q_;
    
    openCreatePersonDialog.and.returnValue($q.when({}));
    openCreateExpenseDialog.and.returnValue($q.when({}));
    
    $scope = $rootScope.$new();

    $mdDialog.show = function() {
      return $q.when();
    };
    
    vm = $controller("DebtAppCtrl", {
      balanceSheetService: balanceSheetService,
      balanceSheetSaveCtrlConfig: {wait: 0},
      openCreatePersonDialog: openCreatePersonDialog,
      openCreateExpenseDialog: openCreateExpenseDialog,
      $mdDialog: $mdDialog,
      $scope: $scope
    });
    
  }));
  
  describe("save function", function() {
    
    it("saves balance sheet on scope digest", function(done) {
      $scope.$digest();
      
      afterTimeout(function() {
        expect(balanceSheetService.save).toHaveBeenCalled();
        done();
      });
      
    });
    
    it("displays error message if saving fails", function(done) {
      balanceSheetService.save.and.throwError("Some error");
      
      $scope.$digest();
      
      afterTimeout(function() {
        expect(vm.errorMessage).toEqual("Cannot save: Some error");
        done();
      });
      
    });
    
    it("clears error message if saving succeeds", function(done) {
      vm.errorMessage = "Unable to save";
      
      $scope.$digest();
      
      afterTimeout(function() {
        expect(vm.errorMessage).toBe(undefined);
        done();
      });

    });
    
    function afterTimeout(fun) {
      setTimeout(fun, 0);
    }
    
  });

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
  
  describe("broadcasts event", function() {
    
    var childKnows;
    
    beforeEach(function() {
      var $childScope = $scope.$new();

      childKnows = false;

      $childScope.$on(events.BALANCE_SHEET_UPDATED, function() {
        childKnows = true;
      });
      
    });
    
    it("when person created", function() {
      vm.createPerson();
      $scope.$digest();
      
      expect(childKnows).toBe(true);
    });
    
    it("when expense created", function() {
      vm.createExpense();
      $scope.$digest();
      
      expect(childKnows).toBe(true);
    });
    
  });

  describe("createNewSheet()", function() {

    it("creates new sheet using service", function() {
      vm.createNewSheet();
      $scope.$digest();

      expect(balanceSheetService.createNew).toHaveBeenCalled();
    });

    it("broadcasts 'balance sheet updated' event", function() {
      var $childScope = $scope.$new();
      var eventBroadCasted = false;
      $childScope.$on(events.BALANCE_SHEET_UPDATED, function() {
        eventBroadCasted = true;
      });

      vm.createNewSheet();
      $scope.$digest();

      expect(eventBroadCasted).toBe(true);
    });

    it("sets correct state", function() {
      vm.createNewSheet();
      $scope.$digest();

      expect($state.go).toHaveBeenCalledWith("balanceSheet");
    });

  });

});

