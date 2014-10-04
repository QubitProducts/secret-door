(function (define) { 'use strict';
  define(function () {

    return function deferred() {
      var d = {};
      var promise = new Promise(function (resolve, reject) {
        d.resolve = resolve;
        d.reject = reject;
      });
      d.promise = promise;
      return d;
    };

  });
})(typeof define === 'function' && define.amd ? define :
/* istanbul ignore next */ function (factory) { module.exports = factory(require); });