var streamstache = require('..');
var test = require('tape');
var Writable = require('readable-stream').Writable;
var Readable = require('readable-stream').Readable;

test('stream in stream', function(t) {
  t.plan(1);

  var outer = streamstache('<div>{foo}</div>');
  outer.name = 'outer';
  var inner = streamstache('<div>{foo}</div>', { foo: rs() })
  inner.name = 'inner';

  outer.foo = inner;

  outer.pipe(ws(function (html) {
    t.equal(html, '<div><div>ohhai</div></div>');
  }));
});

function rs () {
  var s = Readable();
  s._read = function() {
    s.push('oh');
    s.push('hai');
    s.push(null);
  };
  return s;
}

function ws (fn) {
  var s = Writable();
  var buf = [];
  s._write = function(chunk, _, next) {
    buf.push(chunk);
    next();
  }
  s.on('finish', function() {
    fn(buf.join(''));
  });
  return s;
}