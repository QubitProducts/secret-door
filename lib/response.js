import serializeError from './serialize_error';

/**
 * Creates a Response object instance.
 *
 * @param {Request} req The Request object this Response is associated with.
 * @class Response
 * @constructor
 */
export default function Response() {
  this.initialize.apply(this, arguments);
}

/**
 * Initializes a Response object instance.
 *
 * @param  {Object} options
 */
Response.prototype.initialize = function (options) {
  this.id = options.id;
  this.type = 'response';
  this.namespace = options.namespace;
  this.targetWindow = options.targetWindow;
  this.targetOrigin = options.targetOrigin;
  this.success = true;
};

/**
 * Sends the Response data to the requesting window.
 */
Response.prototype.send = function (data) {
  var self = this;

  this.data = data;

  var postSerializedResult = function () {
    var serialized = JSON.stringify(self);
    self.targetWindow.postMessage(serialized, self.targetOrigin);
  };

  return Promise.resolve(this.data).then(function(resolved) {
    self.data = resolved;
    self.success = true;
    postSerializedResult();
  }).catch(function(error) {
    self.data = serializeError(error);
    self.success = false;
    postSerializedResult();
  });
};

/**
 * Returns a stringifiable JSON.
 */
Response.prototype.toJSON = function () {
  return {
    id: this.id,
    type: this.type,
    data: this.data,
    success: this.success,
    namespace: this.namespace
  };
};
