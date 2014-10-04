(function (define) { 'use strict';
define(function (require) {

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
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });