import uniqueId from './unique_id';
import deferred from './deferred';
import stringify from './safe_stringify';

/**
 * Creates a Request object instance.
 *
 * @param {String} name The name of the request.
 * @class Request
 * @constructor
 */
export default function Request() {
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
  this.targetWindow.postMessage(stringify(this), this.targetOrigin);
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
