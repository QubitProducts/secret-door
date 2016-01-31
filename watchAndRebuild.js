'use strict';

var chokidar = require('chokidar');
var childProcess = require('child_process');

chokidar.watch('lib', { ignoreInitial: true }).on('all', function () {
  childProcess.exec('make build');
});

var child = childProcess.spawn('./node_modules/.bin/karma', ['start']);

child.stdout.on('data', function (data) {
  console.log(data.toString());
});

child.stderr.on('data', function (data) {
  console.error(data.toString());
});
