define(function () {

  function safeStringify () {
    /* jshint ignore:start */
    var arrayToJSON = Array.prototype.toJSON;
    Array.prototype.toJSON = undefined;
    var result = JSON.stringify.apply(this, arguments);
    Array.prototype.toJSON = arrayToJSON;
    return result;
    /* jshint ignore:end */
  }

  return {
    stringify: safeStringify,
    parse: JSON.parse
  };

});

