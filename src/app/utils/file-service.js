"use strict";

var angular = require("angular");
var fileSaver = require("node-safe-filesaver");
require("blob-polyfill");

angular.module("debtApp")
  .factory("fileService", fileService);


function fileService($q, $window) {

  return {
    readAsText: readAsText,
    saveAsFile: saveAsFile,
    isSupported: isSupported
  };

  function readAsText(blob) {
    var deferred = $q.defer();

    var reader = new $window.FileReader();
    reader.onload = function() {
      deferred.resolve(reader.result);
    };
    reader.onerror = function() {
      deferred.resolve(reader.error);
    };
    reader.readAsText(blob);

    return deferred.promise;
  }

  function saveAsFile(dataArray, fileName) {
    var blob = new $window.Blob(dataArray, {});
    fileSaver.saveAs(blob, fileName);
  }

  function isSupported() {
    return $window.FileReader && $window.Blob;
  }
}