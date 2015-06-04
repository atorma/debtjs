"use strict";

var _ = require("lodash");
var angular = require("angular");
require("angular-mocks/ngMock");
require("./debt-app-ctrl");
  
describe("DebtAppCtrl", function() {
  
  var vm;

  var events;
  var $scope, $childScope, $state, $q, $window;
  var balanceSheetService;
  var balanceSheet;
  var openCreatePersonDialog;
  var openCreateExpenseDialog;


  beforeEach(angular.mock.module("debtApp"));
  
  
  beforeEach(function() {
    balanceSheet = jasmine.createSpyObj("balanceSheet", ["createPerson", "createExpense"]);
    
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["save", "createNew", "exportToJson", "loadFromJson"]);
    balanceSheetService.balanceSheet = balanceSheet;

    openCreatePersonDialog = jasmine.createSpy("openCreatePersonDialog");
    openCreateExpenseDialog = jasmine.createSpy("openCreateExpenseDialog");

    $state = jasmine.createSpyObj("$state", ["go"]);
  });
  
  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", $state);
  }));

  
  beforeEach(angular.mock.inject(function(_events_, $rootScope, $controller, _$q_, $mdDialog, _$window_) {
    events = _events_;
    $q = _$q_;

    $window = _$window_;
    $window.FileReader = FileReaderStub;

    openCreatePersonDialog.and.returnValue($q.when({}));
    openCreateExpenseDialog.and.returnValue($q.when({}));
    
    $scope = $rootScope.$new();
    $childScope = $scope.$new();

    $mdDialog.show = function() {
      return $q.when();
    };
    
    vm = $controller("DebtAppCtrl", {
      balanceSheetService: balanceSheetService,
      balanceSheetSaveCtrlConfig: {wait: 0},
      openCreatePersonDialog: openCreatePersonDialog,
      openCreateExpenseDialog: openCreateExpenseDialog,
      $mdDialog: $mdDialog,
      $scope: $scope,
      $window: $window
    });

  }));

  function afterTimeout(fun) {
    setTimeout(fun, 0);
  }

  function expectEventBroadcasted(fun, eventName) {
    var eventBroadcasted = false;
    $childScope.$on(eventName, function() {
      eventBroadcasted = true;
    });

    fun();
    $scope.$digest();

    expect(eventBroadcasted).toBe(true);
  }

  function FileReaderStub() {
    this.readAsText = function(file) {
      if (this.onload) {
        this.onload();
      }
      return file;
    };
  }


  describe("init()", function() {

    it("refreshes scope", function() {
      spyOn(vm, "refresh");

      vm.init();

      expect(vm.refresh).toHaveBeenCalled();
    });

  });

  describe("refresh()", function() {

    beforeEach(function() {
      spyOn($window.URL, "createObjectURL");
      spyOn($window.URL, "revokeObjectURL");
      spyOn($window, "Blob");

      vm.init();
    });

    it("updates exposed balance sheet reference", function() {
      balanceSheetService.balanceSheet = "updated sheet";

      vm.refresh();

      expect(vm.balanceSheet).toEqual("updated sheet");
    });

    it("updates URL to json export of the sheet", function() {
      var oldObjectUrl = "an old url";
      vm.jsonExportUrl = oldObjectUrl;

      var json = "balance sheet json";
      balanceSheetService.exportToJson.and.returnValue(json);

      var newObjectUrl = "a new url";
      $window.URL.createObjectURL.and.returnValue(newObjectUrl);

      vm.refresh();

      expect($window.Blob).toHaveBeenCalledWith([json], {type: "application/json"});
      expect($window.URL.createObjectURL).toHaveBeenCalled();
      expect(vm.jsonExportUrl).toBe(newObjectUrl);
      expect($window.URL.revokeObjectURL).toHaveBeenCalledWith(oldObjectUrl);
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

    it("is triggered by 'balance sheet updated' event", function(done) {
      spyOn(vm, "save");

      $scope.$emit(events.BALANCE_SHEET_UPDATED);

      afterTimeout(function() {
        expect(vm.save).toHaveBeenCalled();
        done();
      });

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
      var jsonString = "{}";
      var jsonBlob =  new $window.Blob([jsonString], {type: "application/json"});
      var jsonFile = new $window.File([jsonBlob], "sheet.json");

      vm.loadSheet([jsonFile]);

      // Difficult to get in between a new FileReader and the onload callback
      //expect(balanceSheetService.loadFromJson).toHaveBeenCalledWith(jsonString);

      expect(vm.save).toHaveBeenCalled();
      expect(vm.refresh).toHaveBeenCalled();

      expect($state.go).toHaveBeenCalledWith("balanceSheet");
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
      var jsonString = "{}";
      var jsonBlob =  new $window.Blob([jsonString], {type: "application/json"});
      var jsonFile = new $window.File([jsonBlob], "sheet.json");

      expectEventBroadcasted(function() {
        vm.loadSheet([jsonFile]);
      }, events.BALANCE_SHEET_UPDATED);
    });

  });



});

