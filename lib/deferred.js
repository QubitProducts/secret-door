define(function () {
  return function deferred() {
    var d = {};
    var promise = new Promise(function (resolve, reject) {
      d.resolve = resolve;
      d.reject = reject;
    });
    d.promise = promise;
    return d;
  };
});