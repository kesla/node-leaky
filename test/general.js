var leaky = require('../leaky');

var test = require("tap").test;

test('Test', function(t) {
  var source = '(' + function() {
    var a = 123;
  } + ')';
  var err = leaky(source);
  t.equal(err, undefined);

  source = '(' + function() {
    a = 123;
  } + ')';
  err = leaky(source);
  t.ok(err instanceof leaky.LeakError, 'err should be a LeakError');
  t.equal(err.line, 2);
  t.equal(err.column, 4);

  source = '(' + function() {
    a = 123;
    var a;
  } + ')';
  err = leaky(source);
  t.equal(err, undefined);

  t.end();
});