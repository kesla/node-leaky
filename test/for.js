var leaky = require('../leaky');

var test = require("tap").test;

test('for #1', function(t) {
  var source = '(' + function() {
    for(var i = 0, j = 0; i < 10; i = i + 1) {
      i = 10;
    }
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('for #2', function(t) {
  var source = '(' + function() {
  	for (var i = 0; i < 10; j = j + 1) {
  	}
  } + ')';
  var err = leaky(source);
  t.ok(err instanceof leaky.LeakError, 'err should be a LeakError');
  t.equal(err.line, 2);
  t.equal(err.column, 27);
  t.end();
});

test('for #3', function(t) {
  // test that it doesn't crash when stuff are not initalized
  // TODO: test that this doesn't throw
  var source = '(' + function() {
    for (;;) {
    }
  } + ')';
  var err = leaky(source);
  t.end();
});

test('for #4', function(t) {
  var source = '(' + function() {
    for (var i = 0; i < 10; i++) {
    }
    i = 123;
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);
  t.end();
});

test('for #5', function(t) {
  // yes, javascript is a really stupid language :)
  var source = '(' + function() {
    function foo() {
      i = 123;
    }
    for (var i = 0; i < 10; i++) {
    }
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);

  t.end();
});