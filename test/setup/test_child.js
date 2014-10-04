require.config({
  baseUrl: '/base/lib'
});
require(['door'], function (Door) {
  window.__child = true;
  window.channel1 = new Door({
    targetWindow: window.parent
  });
  window.channel2 = new Door({
    targetWindow: window.parent,
    namespace: 'differentNamespace'
  });

  window.pm = function (data, origin) {
    window.parent.postMessage(data, origin);
  };
});