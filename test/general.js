var leaky = require('../leaky');

var test = require("tap").test;

test('common #1', function(t) {
  var source = '(' + function() {
    var a = 123;
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('common #2', function(t) {
  var source = '(' + function() {
    a = 123;
  } + ')';
  var err = leaky(source);
  t.ok(err instanceof leaky.LeakError, 'err should be a LeakError');
  t.equal(err.line, 2);
  t.equal(err.column, 4);
  t.end();
});

test('common #3', function(t) {
  var source = '(' + function() {
    a = 123;
    var a;
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);

  t.end();
});