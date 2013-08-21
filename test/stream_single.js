var streamstache = require('..');
var test = require('tape');
var Readable = require('readable-stream').Readable;
var Writable = require('readable-stream').Writable;

test('stream single', function(t) {
  t.plan(1);

  var tmpl = streamstache('<div>{foo}</div>');
  tmpl.set('foo', rs());

  tmpl.pipe(ws(function (html) {
    t.equal(html, '<div>ohhai</div>');
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