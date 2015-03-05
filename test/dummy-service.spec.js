"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../src/debt");

describe("dummyService", function() {

	var $httpBackend;
	var dummyService;

	beforeEach(angular.mock.module("debtApp"));

	beforeEach(angular.mock.inject(function(_$httpBackend_, _dummyService_) {
		$httpBackend = _$httpBackend_;
		dummyService = _dummyService_;
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
		expect(true).toBeTruthy(); // avoid SPEC HAS NO EXPECTATIONS
	});

	it("calls correct url", function() {
		$httpBackend.expectGET("http://www.hs.fi").respond(200);

		dummyService.getHesari();

		$httpBackend.flush();
	});

});