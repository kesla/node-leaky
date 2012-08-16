var leaky = require('../leaky');

var test = require("tap").test;

test('simple, does not throw', function(t) {
  var source = 'var a = 123';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('simple, does throw', function(t) {
  var source = 'a = 123;';
  var err = leaky(source);
  t.ok(err instanceof leaky.LeakError, 'err should be a LeakError');
  t.equal(err.line, 1);
  t.equal(err.column, 0);
  t.equal(err.toString().split('\n')[2], source);
  t.end();
});

test('two-liner, does not throw', function(t) {
  var source ='a = 123;\nvar a;';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('return', function(t) {
  var source = 'return;';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('hashbang', function(t) {
  var source = '#!/usr/bin/env node\nvar a = 123;';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('syntax error', function(t) {
  var source = 'if (';
    var err = leaky(source);
    t.ok(err instanceof SyntaxError);
    t.end();
});