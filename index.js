(function (define) { 'use strict';
  define(function (require) {

    return require('./lib/door');

  });
})(typeof define === 'function' && define.amd ? define :
/* istanbul ignore next */ function (factory) { module.exports = factory(require); });