'use strict';

/*global desc: true, task: true, jake: true, complete: true*/

var findFiles = function(files, extensions, callback) {
  var find = require('find');
  var finished = 0,
    dirs = ['lib', 'test'];

  for (var i = 0; i < extensions.length; i++) {
    extensions[i] = '\\.' + extensions[i];
  }

  var exp = new RegExp('(?:' + extensions.join('|') + ')$');

  var found = function() {
    finished++;
    if (dirs.length === finished) {
      callback(files);
    }
  };

  dirs.forEach(function(dir) {
    find.file(exp, dir, function(f) {
      files = files.concat(f);
      found();
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
  findFiles(['Jakefile', 'interoperability/Jakefile'], ['js'], function(files) {
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
  findFiles(['Jakefile', 'package.json', 'interoperability/Jakefile', '.jshintrc', '.jsbeautifyrc'], ['js', 'json'], function(files) {
    jake.exec('./node_modules/.bin/js-beautify ' + files.join(' '), {
      printStdout: true,
      printStderr: true
    }, function() {
      complete();
    });
  });
});

desc('Clean dev dependencies');
task('clean', function() {
  var rimraf = require('rimraf');
  [
    'package-lock.json',
    'node_modules'
  ].forEach(function(path) {
    rimraf(path, function(err) {
      if (err) {
        console.error(err);
      }
    });
  });
});

// task shortcuts
task('b', ['beautify']);
task('t', ['test']);
task('m', ['mocha']);
task('j', ['jshint']);
task('s', ['setup']);
task('c', ['clean']);
