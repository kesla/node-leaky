var leaky = require('../leaky');

var test = require("tap").test;

test('functions #1', function(t) {
  var source = '(' + function() {
    a = 123;
    function a() {
    }
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('functions #2', function(t) {
  var source = '(' + function() {
    var a;
    function foo() {
      a = 123;
    }
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('functions #3', function(t) {
  var source = '(' + function() {
    var b = function a() {
    }
    a = 123;
  } + ')';
  var err = leaky(source);
  t.ok(err instanceof leaky.LeakError, 'err should be a LeakError');
  t.equal(err.line, 4);
  t.equal(err.column, 4);
  t.end();
});

test('functions #4', function(t) {
  var source = '(' + function() {
    function a() {
      var b;
    }
    b = 123;
  } + ')';
  var err = leaky(source);
  t.ok(err instanceof leaky.LeakError, 'err should be a LeakError');
  t.equal(err.line, 5);
  t.equal(err.column, 4);
  t.end();
});

test('functions #5', function(t) {
  var source = '(' + function(foo) {
    foo = 'bar';
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('functions #6', function(t) {
  var source = function foozie(foo) {
    a = 'b';
  }.toString();
  var err = leaky(source);
  t.ok(err instanceof leaky.LeakError, 'err should be a LeakError');
  t.equal(err.line, 2);
  t.equal(err.column, 4);
  t.end();
});

test('functions #7', function(t) {
  var source = function foozie(foo) {
    foo = 'bar';
  }.toString();
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});