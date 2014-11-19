module.exports = function(config) {

  config.set({

    basePath: '.',

    // frameworks to use
    frameworks: ['mocha', 'requirejs'],

    // list of files / patterns to load in the browser
    files: [
      {pattern: 'node_modules/sinon/pkg/sinon.js', included: false},
      {pattern: 'node_modules/expect.js/expect.js', included: false},
      {pattern: 'node_modules/jquery/dist/jquery.js', included: false},
      {pattern: 'test/setup/child.html', included: false},
      {pattern: 'test/setup/test_child.js', included: false},
      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'test/*_test.js', included: false},
      'test/setup/test_main.js'
    ],

    preprocessors: {
      'lib/**/*.js': ['coverage']
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type : 'text',
      dir : 'coverage/'
    },

    browsers: ['Firefox'],

    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO
  });
};
