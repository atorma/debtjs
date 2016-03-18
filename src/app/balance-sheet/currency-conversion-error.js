"use strict";

function CurrencyConversionError(message) {
  var temp = Error.apply(this, arguments);
  //temp.name = this.name = 'CurrencyConversionError';
  this.stack = temp.stack;
  this.message = temp.message;
}

CurrencyConversionError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: CurrencyConversionError,
    writable: true,
    configurable: true
  }
});

module.exports = CurrencyConversionError;