module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      local: {
        options: {
          reporter: 'spec',
          // captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
          ui: 'tdd',
        },
        src: ['test/api/*.js', 'test/unitTest/*.js'],
      },
      circleCI: {
        options: {
          reporter: 'spec',
          // captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
          ui: 'tdd',
        },
        src: ['test/CItest/*.js'],
      },
    },
    mocha_istanbul: {
      coverage: {
        src: ['test/**/*.js'],
        // src: ['test/api/*.js', 'test/unitTest/*.js'],
        // src: ['test/CItest/*.js'],
        options: {
          mochaOptions: ['--ui', 'tdd'], // any extra options for mocha
        },
      },
    },
    env: {
      test: {
        NODE_ENV: 'test',
        PORT: 3001,
      },
      circle_test: {
        NODE_ENV: 'circle_test',
      },
    },
  });

  // Load the plugin that provides the "uglify" task.
  // grunt.loadNpmTasks('grunt-mocha'); Client Side testing
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('CITest');

  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-env');


  // Test
  grunt.registerTask('test', ['env:test', 'mochaTest:local']);
  grunt.registerTask('circle_test', ['env:circle_test', 'mochaTest:circleCI']);

  // Coverage
  grunt.registerTask('coverage', ['env:test', 'mocha_istanbul']);
};
