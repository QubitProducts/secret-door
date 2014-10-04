var tests = Object.keys(window.__karma__.files).filter(function (file) {
  return (/^\/base\/test\/.*_test.js$/).test(file);
});

requirejs.config({
  baseUrl: "/base/lib",
  paths: {
    // also add these to karma.conf.js
    "sinon": "../node_modules/sinon/pkg/sinon",
    "expect": "../node_modules/expect.js/expect",
    "jquery": "../node_modules/jquery/dist/jquery"
  },
  deps: tests,
  shim: {
    "sinon": {
      exports: "sinon"
    },
    "expect": {
      exports: "expect"
    }
  },
  callback: window.__karma__.start
});
