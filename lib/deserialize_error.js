(function (define) { 'use strict';
  define(function () {

    return function deserializeError(serializedError) {
      var error = new Error(serializedError.msg);

      for (var key in serializedError) {
        if (serializedError.hasOwnProperty(key)) {
          error[key] = serializedError[key];
        }
      }

      return error;
    };

  });
})(typeof define === 'function' && define.amd ? define :
/* istanbul ignore next */ function (factory) { module.exports = factory(require); });