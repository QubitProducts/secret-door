# secret-door

secret-door is an RPC implementation on top of `window.postMessage` for cross context communication in the browser. It can be used, for example, to call functions in a cross domain iframe.

secret-door returns promises when executing remote functions and therefore assumes that `window.Promise` is available.

## Install

npm install --save secret-door

## Usage

Parent window.

```js
var Channel = require("secret-door");

var channel = new Channel({
  targetWindow: document.querySelectorAll(".some-iframe")[0].contentWindow
}).setHandler({
  foo: function () {},
  bar: function () {}
}, this);

// set additional handler
channel.setHandler("getAnswer", function (arg1, arg2) {
  // we can return a promise
  return new Promise(function (resolve) {
    return doSomething(arg1 + arg2);
  })
}, this)

// unset a handler
channel.clearHandler("bar");

// set a catch all handler
channel.setHandler("*", function (command, arg1, arg2, arg3) {
  // all remote command calls that don't have a registered named handler can
  // be handler here
});

//call a function within the iframe
channel.execute("getURL").then(function (url) {
  console.log(url);
});
```

An iframe.

```js
var channel = new Channel({
  targetWindow: window.parent
}).setHandler({
  getURL: function () {
    return window.location.href;
  }
});
channel.execute("getAnswer", 2, 5).then(function (answer) {
  console.log(answer);
});
```

## API

### var channel = new Channel(options)

* **options.targetWindow** - The window to send messages to (e.g. iframeEl.contentWindow, window.parent)
* **options.targetOrigin** - What the origin of the other window must be for sending messages
* **options.namespace** - Allows using multiple instances of door on the same page
* **options.filterIncoming** - A function that can reject an incoming message by inspecting the message event

### channel.setHandler()

```js
channel.setHandler(name, fn, context);
channel.setHandler(obj, context);
```

Set the handler for incoming commands.

The handler can be named via the first argument.
e.g. door.setHandler('foo', function () {});

The handler can also be an object mapping names to functions.
e.g. door.setHandler({foo: function () {}, bar: function () {}});

Both can be used in combination. Further calls to either will extend the list of channel's handlers.

The last argument can be used to pass the context that the handler functions will applied in.

To handle all incoming commands for which a named handler is not available, register a handler with name "*".
e.g. door.setHandler('*', function (command, arg1) {console.log('handling all commands')});

Handlers can return promises.

### channel.clearHandler(name)

Remove the handler.

### channel.execute(fnName, ...args)

Execute a function on the other side of the channel. First argument is the name of the remote function. The rest of the arguments will be passed as arguments to the remote function.

Returns a promise.

### channel.destroy()

Remove handler references and stop listening to events.


## Test

```
npm test
```