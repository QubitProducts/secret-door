require.config({
  baseUrl: '/base/dist'
});
require(['door-umd'], function (Door) {
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
