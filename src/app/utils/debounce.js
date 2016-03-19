"use strict";

angular.module("debtApp")
  .factory("debounce", debounceFactory);


function debounceFactory($timeout) {

  return debounce;

  /**
   * Returns a function, that, as long as it continues to be invoked, will not be triggered.
   * The function will be called after it stops being called for N milliseconds.
   *
   * @param {function} func - The function to "debouncify"
   * @param {number} [wait=10] - The time to wait (milliseconds) after the last call until func is called
   * @param {Scope} [scope] - Angular scope to call the function in
   * @param {boolean} [invokeApply=false] - Should the function call trigger $digest
   * @returns {function} - The debounced function
   */
  function debounce(func, wait, scope, invokeApply) {
    var timer;

    return function debounced() {
      var context = scope,
        args = Array.prototype.slice.call(arguments);

      $timeout.cancel(timer);
      timer = $timeout(function() {

        timer = undefined;
        func.apply(context, args);

      }, wait || 10, invokeApply);
    };
  }

}


