define(function (require) {

  var DoorError = require("./error");

 /**
   * Creates a Response object instance.
   *
   * @param {Request} req The Request object this Response is associated with.
   * @class Response
   * @constructor
   */
  function Response() {
    this.initialize.apply(this, arguments);
  }

  /**
   * Initializes a Response object instance.
   *
   * @param  {Request} req The Request object this Response is associated with.
   */
  Response.prototype.initialize = function (req, data) {
    this.id = req.id;
    this.type = 'response';
    this.namespace = req.namespace;
    this.data = data;
    this.success = true;
  };

  Response.prototype.call = function (funcName) {
    var func = window[funcName];
    var data = [].slice.call(arguments, 1);
    return func.apply(window, data);
  };

  /**
   * Sends the Response data to the requesting window.
   */
  Response.prototype.send = function () {
    var self = this;

    var postSerializedResult = function () {
      var serialized = JSON.stringify(self);
      self.targetWindow.postMessage(serialized, self.targetOrigin);
    };

    return Promise.resolve(this.data).then(function(resolved) {
      self.data = resolved;
      self.success = true;
      postSerializedResult();
    }).catch(function(error) {
      self.data = new DoorError(error);
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

  return Response;

});