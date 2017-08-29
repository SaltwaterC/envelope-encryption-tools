'use strict';

/*global desc: true, task: true, jake: true, complete: true*/

var findFiles = function(files, extensions, callback) {
  var find = require('find');

  for (var i = 0; i < extensions.length; i++) {
    extensions[i] = '\\.' + extensions[i];
  }

  var exp = new RegExp('(?:' + extensions.join('|') + ')$');

  find.file(exp, 'lib', function(f) {
    files = files.concat(f);
    find.file(exp, 'test', function(f) {
      files = files.concat(f);
      callback(files);
    });
  });
};

desc('Installs all dependencies');
task('setup', {
  async: true
}, function() {
  jake.exec('npm install', {
    printStdout: true,
    printStderr: true
  }, function() {
    complete();
  });
});

desc('Runs jshint');
task('jshint', {
  async: true
}, function() {
  findFiles(['Jakefile'], ['js'], function(files) {
    jake.exec('./node_modules/.bin/jshint ' + files.join(' '), {
      printStdout: true,
      printStderr: true
    }, function() {
      complete();
    });
  });
});

desc('Runs mocha');
task('mocha', {
  async: true
}, function() {
  var cmds = [
    './node_modules/.bin/mocha --reporter dot'
  ];

  jake.exec(cmds, {
    printStdout: true,
    printStderr: true
  }, function() {
    complete();
  });
});

desc('Runs the test suite');
task('test', ['jshint', 'mocha']);

desc('Runs js-beautify');
task('beautify', {
  async: true
}, function() {
  findFiles(['Jakefile', 'package.json'], ['js', 'json'], function(files) {
    jake.exec('./node_modules/.bin/js-beautify --end-with-newline --replace --indent-size 2 ' + files.join(' '), {
      printStdout: true,
      printStderr: true
    }, function() {
      complete();
    });
  });
});

// task shortcuts
task('b', ['beautify']);
task('t', ['test']);
task('m', ['mocha']);
task('j', ['jshint']);
task('s', ['setup']);
