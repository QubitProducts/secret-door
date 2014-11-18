(function (define) { 'use strict';
  define(function (require) {

    var uniqueId = require('./unique_id');
    var deferred = require('./deferred');
    var SafeJSON = require('./safe_json');

    /**
     * Creates a Request object instance.
     *
     * @param {String} name The name of the request.
     * @class Request
     * @constructor
     */
    function Request() {
      this.initialize.apply(this, [].slice.call(arguments));
    }

    Request.prototype.initialize = function (options) {
      this.id = uniqueId();
      this.type = 'request';
      this.data = options.data;
      this.namespace = options.namespace;
      this.targetWindow = options.targetWindow;
      this.targetOrigin = options.targetOrigin;

      this.deferred = deferred();
      this.resolve = this.deferred.resolve;
      this.reject = this.deferred.reject;
    };

    /**
     * Sends the request to the target window.
     */
    Request.prototype.send = function () {
      this.targetWindow.postMessage(SafeJSON.stringify(this), this.targetOrigin);
      return this.deferred.promise;
    };

    /**
     * Returns a stringifiable JSON.
     */
    Request.prototype.toJSON = function () {
      return {
        id: this.id,
        type: this.type,
        data: this.data,
        namespace: this.namespace
      };
    };

    return Request;

  });
})(typeof define === 'function' && define.amd ? define :
/* istanbul ignore next */ function (factory) { module.exports = factory(require); });