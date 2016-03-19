"use strict";

var _ = require("lodash");
var angular = require("angular");
require("angular-mocks/ngMock");
require("./debt-app-ctrl");
  
describe("DebtAppCtrl", function() {
  
  var vm;

  var events;
  var $rootScope, $scope, $childScope, $state, $q, $window;
  var balanceSheetService;
  var balanceSheet;
  var balanceSheetJson;
  var openCreatePersonDialog;
  var openCreateExpenseDialog;
  var fileService;

  beforeEach(angular.mock.module("debtApp"));
  
  
  beforeEach(function() {
    balanceSheet = jasmine.createSpyObj("balanceSheet", ["createPerson", "createExpense"]);

    balanceSheetJson = '{"name": "test"}';
    
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["init", "save", "createNew", "exportToJson", "loadFromJson"]);
    balanceSheetService.balanceSheet = balanceSheet;
    balanceSheetService.exportToJson.and.returnValue(balanceSheetJson);

    openCreatePersonDialog = jasmine.createSpy("openCreatePersonDialog");
    openCreateExpenseDialog = jasmine.createSpy("openCreateExpenseDialog");

    fileService = jasmine.createSpyObj("fileService", ["saveAsFile", "readAsText", "isSupported"]);
    fileService.isSupported.and.returnValue(true);

    $state = jasmine.createSpyObj("$state", ["go"]);
  });
  
  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", $state);
    $provide.value("debounce", function(fun) {
      return fun;
    });
  }));

  
  beforeEach(angular.mock.inject(function(_events_, _$rootScope_, $controller, _$q_, $mdDialog, _$window_) {
    events = _events_;
    $q = _$q_;

    $window = _$window_;

    openCreatePersonDialog.and.returnValue($q.when({}));
    openCreateExpenseDialog.and.returnValue($q.when({}));

    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $childScope = $scope.$new();

    $mdDialog.show = function() {
      return $q.when();
    };

    vm = $controller("DebtAppCtrl", {
      balanceSheetService: balanceSheetService,
      openCreatePersonDialog: openCreatePersonDialog,
      openCreateExpenseDialog: openCreateExpenseDialog,
      fileService: fileService,
      $mdDialog: $mdDialog,
      $scope: $scope
    });

  }));

  function expectEventBroadcasted(fun, eventName) {
    var eventBroadcasted = false;
    $childScope.$on(eventName, function() {
      eventBroadcasted = true;
    });

    fun();
    $scope.$digest();

    expect(eventBroadcasted).toBe(true);
  }

  it("listens to error events and displays error messages", function() {
    var errorMessage = "Error message";
    var error = new Error(errorMessage);
    $rootScope.$broadcast(events.ERROR, error);

    expect(vm.errorMessage).toBe(errorMessage);
  });


  describe("init()", function() {

    it("initializes balance sheet service", function() {
      var initializedSheet = {name: "Initialized sheet"};
      balanceSheetService.init.and.callFake(function() {
        balanceSheetService.balanceSheet = initializedSheet;
      });

      vm.init();

      expect(balanceSheetService.init).toHaveBeenCalled();
      expect(vm.balanceSheet).toBe(initializedSheet);
    });

  });


  describe("save()", function() {

    it("saves sheet using service", function() {
      vm.save();

      expect(balanceSheetService.save).toHaveBeenCalled();
    });

    it("displays error message if saving fails", function() {
      balanceSheetService.save.and.throwError("Some error");

      vm.save();

      expect(vm.errorMessage).toEqual("Cannot save: Some error");
    });
    
    it("clears error message if saving succeeds", function() {
      vm.errorMessage = "Unable to save";

      vm.save();

      expect(vm.errorMessage).toBe(undefined);
    });

    it("is triggered by 'balance sheet updated' event", function() {
      spyOn(vm, "save");

      $scope.$emit(events.BALANCE_SHEET_UPDATED);

      expect(vm.save).toHaveBeenCalled();
    });

  });


  describe("creates", function() {

    beforeEach(function() {
      spyOn(vm, "save");
      spyOn(vm, "refresh");
    });


    it("person using data and options from dialog", function() {
      var dialogResult = {
        person: {name: "Anssi"},
        options: {createParticipations: true}
      };
      openCreatePersonDialog.and.returnValue($q.when(dialogResult));

      vm.createPerson();
      $scope.$digest();

      expect(balanceSheet.createPerson).toHaveBeenCalledWith(dialogResult.person, dialogResult.options);
      expect(vm.save).toHaveBeenCalled();
      expect(vm.refresh).toHaveBeenCalled();
    });

    it("expense using data and options from dialog", function() {
      var dialogResult = {
        expense: {name: "Stuff", sharing: "equal"},
        options: {createParticipations: true}
      };
      openCreateExpenseDialog.and.returnValue($q.when(dialogResult));

      vm.createExpense();
      $scope.$digest();

      expect(balanceSheet.createExpense).toHaveBeenCalledWith(dialogResult.expense, dialogResult.options);
      expect(vm.save).toHaveBeenCalled();
      expect(vm.refresh).toHaveBeenCalled();
    });

    it("new sheet using service, and updates view state", function() {
      vm.createNewSheet();
      $scope.$digest();

      expect(balanceSheetService.createNew).toHaveBeenCalled();
      expect(vm.save).toHaveBeenCalled();
      expect(vm.refresh).toHaveBeenCalled();

      expect($state.go).toHaveBeenCalledWith("balanceSheet");
    });

    it("sheet from JSON file, and updates view state", function() {
      var jsonBlob =  new $window.Blob([balanceSheetJson], {type: "application/json"});
      fileService.readAsText.and.returnValue($q.when(balanceSheetJson));

      vm.loadSheet([jsonBlob]);
      $scope.$digest();

      expect(fileService.readAsText).toHaveBeenCalledWith(jsonBlob);
      expect(balanceSheetService.loadFromJson).toHaveBeenCalledWith(balanceSheetJson);
      expect(vm.save).toHaveBeenCalled();
      expect(vm.refresh).toHaveBeenCalled();

      expect($state.go).toHaveBeenCalledWith("balanceSheet");
    });

    it("error message when loading sheet from file but file operations not supported", function() {
      fileService.isSupported.and.returnValue(false);

      var jsonBlob =  new $window.Blob([balanceSheetJson], {type: "application/json"});
      fileService.readAsText.and.returnValue($q.when(balanceSheetJson));

      vm.loadSheet([jsonBlob]);
      $scope.$digest();

      expect(vm.errorMessage).toBeDefined();

      expect(fileService.readAsText).not.toHaveBeenCalled();
      expect(balanceSheetService.loadFromJson).not.toHaveBeenCalled();
      expect(vm.save).not.toHaveBeenCalled();
      expect(vm.refresh).not.toHaveBeenCalled();
    });

  });


  describe("exportSheet()", function() {

    it("exports sheet by saving it as file", function() {
      balanceSheet.name = "my sheet";

      vm.exportSheet();

      expect(fileService.saveAsFile).toHaveBeenCalledWith([balanceSheetJson], "my sheet.txt");
    });

    it("sets error message if file operations not supported", function() {
      fileService.isSupported.and.returnValue(false);

      vm.exportSheet();

      expect(vm.errorMessage).toBeDefined();
      expect(fileService.saveAsFile).not.toHaveBeenCalled();
    });

  });


  describe("broadcasts event", function() {
    
    it("when person created", function() {
      expectEventBroadcasted(vm.createPerson, events.BALANCE_SHEET_UPDATED);
    });
    
    it("when expense created", function() {
      expectEventBroadcasted(vm.createExpense, events.BALANCE_SHEET_UPDATED);
    });

    it("when sheet created", function() {
      expectEventBroadcasted(vm.createNewSheet, events.BALANCE_SHEET_UPDATED);
    });

    it("when sheet loaded", function() {
      var jsonBlob =  new $window.Blob([balanceSheetJson], {type: "application/json"});

      expectEventBroadcasted(function() {
        fileService.readAsText.and.returnValue($q.when(balanceSheetJson));

        vm.loadSheet([jsonBlob]);
      }, events.BALANCE_SHEET_UPDATED);
    });

  });


});

