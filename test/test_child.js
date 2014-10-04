requirejs.config({
  baseUrl: "/base/lib"
});
require(["door"], function (Door) {
  window.__child = true;
  window.door = new Door({
    targetWindow: window.parent
  });
});