define(function (require) {
  'use strict';

  var DoorError = require('./error');
  var Request = require('./request');
  var Response = require('./response');

  function Door() {
    this.initialize.apply(this, arguments);
  }

  /**
   * Initialize door. In both the windows (frames), add the below code:
   *
   * @option {String} [namespace] Allows using multiple instances of door on the same page
   * @option {String} [targetWindow] The window to send messages to (an iframe or parent window).
   * @option {String} [targetOrigin] What the origin of the other window must be.
   * @option {String} [filterIncoming] A function that can reject an incoming message by inspecting the message event.
   * @return {Object} A door object instance.
   *
   * @api public
   */
  Door.prototype.initialize = function (options) {
    options = options || {};

    this.options = {
      targetWindow: options.targetWindow,
      namespace: options.namespace || 'door',
      targetOrigin: options.targetOrigin || '*',
      filterIncoming: options.filterIncoming || function () {
        return true;
      }
    };

    if (!options.targetWindow) {
      throw new Error('Please provide options.targetWindow (e.g. iframeEl.contentWindow or window.parent)');
    }

    this.requests = {};
    this.handlers = {};

    // lift this function to make it a different instance from the prototype one,
    // since we're adding a global event listener
    this.handleMessage = this.handleMessage.bind(this);

    this.bindEvents();
  };

  /**
   * Destructor
   *
   * @api public
   */
  Door.prototype.destroy = function () {
    this.handlers = {};
    this.clearHandler();
    this.unbindEvents();
  };

  /**
   * Set the handler for incoming commands.
   *
   * The handler can be a function which will then receive the arguments
   * as sent from the other side. Useful when you want to handler all commands from
   * the other side.
   *
   * e.g. door.setHandler(function () {console.log('handling all commands')});
   *
   * The handler can be named via the first argument which case it will only be called
   * if the first argument of the incoming command matches the name of the handler.
   * e.g. door.setHandler('foo', function () {});
   *
   * The handler can also be an object, which case the first argument will
   * be interpreted as a command, and a function with that name will be called
   * on the handler object.
   * e.g. door.setHandler({foo: function () {}, bar: function () {}});
   *
   * @api public
   */
  Door.prototype.setHandler = function (name, fn, context) {
    var handlers;
    if (isString(name)) {
      this.handlers[name] = {fn: fn, context: context};
    } else {
      handlers = name;
      context = fn;
      for (var key in handlers) {
        if (handlers.hasOwnProperty(key)) {
          this.handlers[key] = {
            fn: handlers[key],
            context: context
          };
        }
      }
    }
    return this;
  };

  Door.prototype.clearHandler = function (name) {
    delete this.handlers[name];
  };

  /**
   * Invokes a function in the other window. Pass any arguments needed
   * after the function name. Returns a promise. After the function finishes executing in
   * the other window, the promise is resolved to the return value of the function.
   *
   * @param  {String} functionName The function name to call in the other window.
   * @param  {...} args... Any parameters to pass to the function.
   * @return {Promise} A promise object. Resolves to either the return value
   * of the function, or fails resolution if an error occurs in the other window.
   *
   * @api public
   */
  Door.prototype.execute = function () {
    var req = new Request({
      namespace: this.options.namespace,
      targetWindow: this.options.targetWindow,
      targetOrigin: this.options.targetOrigin,
      data: Array.prototype.slice.call(arguments)
    });
    this.requests[req.id] = req;
    return req.send();
  };

  /**
   * The following are private methods
   * @api private
   */

  /**
   * Listen to the global postMessage event
   */
  Door.prototype.bindEvents = function () {
    this.unbindEvents();
    window.addEventListener('message', this.handleMessage);
  };

  /**
   * Stop listening to the global postMessage event
   */
  Door.prototype.unbindEvents = function () {
    window.removeEventListener('message', this.handleMessage);
  };

  /**
   * postMessage handler
   */
  Door.prototype.handleMessage = function (messageEvent) {
    // only handle messages that come from the window we're communicating to
    if (messageEvent.source !== this.options.targetWindow) {
      return;
    }

    // apply the optional filter
    if (!this.options.filterIncoming(messageEvent)) {
      return;
    }

    var data;
    try {
      data = JSON.parse(messageEvent.data);
    } catch (e) {
      return;
    }

    // filter the message by namespace
    if (data.namespace !== this.options.namespace) {
      return;
    }

    if (data.type === 'request') {
      var response = new Response(data, this.handleCommand.apply(this, data.data));
      response.targetWindow = messageEvent.source;
      // messageEvent.origin is 'null' in case of file:// url.
      // For such environment we use the default targetOrigin
      response.targetOrigin = messageEvent.origin === 'null'
        ? this.options.targetOrigin
        : messageEvent.origin;
      response.send();
    } else if (data.type === 'response') {
      if (data.success) {
        this.requests[data.id].resolve(data.data);
      } else {
        this.requests[data.id].reject(new DoorError(data.data));
      }
      delete this.requests[data.id];
    }
  };

  Door.prototype.handleCommand = function (command) {
    var handlers = this.handlers;
    var handler, args = Array.prototype.slice.call(arguments);
    if (handlers[command] || handlers['*']) {
      handler = handlers[command] || handlers['*'];
    }

    // for non catch all handlers, we need to remove the command name itself
    // from the argument list. For catch all, we keep all arguments.
    if (handlers['*'] !== handler) {
      args.shift();
    }

    if (handler) {
      return handler.fn.apply(handler.context, args);
    } else {
      throw new Error("SecretDoor failed to handle command '" +
        command + "' in namespace '" + this.options.namespace + "'");
    }
  };

  function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
  }

  return Door;

});