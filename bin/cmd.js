#!/usr/bin/env node

var path = require('path');

var fs = require('graceful-fs');
var glob = require("glob");
var argv = require('optimist')
  .boolean('r')
  .default('r', false)
  .argv;

var leaky = require('../leaky');

var input = argv._[0];
var dirPattern = path.join(input, (argv.r ? '**/*.js' : '*.js'));

function checkFile(fileName) {
  fs.readFile(path.resolve(fileName), 'utf8', function (err, str) {
    if (err) throw err;

    var err = leaky(str, fileName);
    if (err) {
      console.log(err);
      process.exit(1);
    }
  });
}

function getFiles(err, files) {
  if (err) throw err;
  files.forEach(checkFile);
}

fs.stat(path.resolve(input), function (err, stats) {
  if (err) throw err;

  if (stats.isDirectory()) {
    glob(dirPattern, getFiles);
  }

  if(stats.isFile()) {
    checkFile(input);
  }
});
