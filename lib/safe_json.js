define(function () {

  function safeStringify () {
    /* jshint ignore:start */
    var arrayToJSON = Array.prototype.toJSON;
    if (arrayToJSON) {
      Array.prototype.toJSON = undefined;
    }
    var result = JSON.stringify.apply(this, arguments);
    if (arrayToJSON) {
      Array.prototype.toJSON = arrayToJSON;
    }
    return result;
    /* jshint ignore:end */
  }

  return {
    stringify: safeStringify,
    parse: JSON.parse
  };

});
