var leaky = require('../leaky');

var test = require("tap").test;

test('leaking function variables n', function(t) {
  var source = '(' + function() {
    a = 123;
    function a() {
    }
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);

  source = '(' + function() {
    var a;
    function foo() {
      a = 123;
    }
  } + ')';
  err = leaky(source);
  t.equal(err, undefined);

  source = '(' + function() {
    var b = function a() {
    }
    a = 123;
  } + ')';
  err = leaky(source);
  t.ok(err instanceof leaky.LeakError, 'err should be a LeakError');
  t.equal(err.line, 4);
  t.equal(err.column, 4);

  source = '(' + function() {
    function a() {
      var b;
    }
    b = 123;
  } + ')';
  err = leaky(source);
  t.ok(err instanceof leaky.LeakError, 'err should be a LeakError');
  t.equal(err.line, 5);
  t.equal(err.column, 4);

  t.end();
});