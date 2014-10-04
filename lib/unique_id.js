(function (define) { 'use strict';
  define(function () {

    return function () {
      var id = + new Date();
      while (id === + new Date()) {
        // deliberately empty
      }
      id = + new Date();
      return id;
    };

  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });