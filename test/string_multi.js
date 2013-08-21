var streamstache = require('..');
var test = require('tape');
var Readable = require('readable-stream').Readable;
var Writable = require('readable-stream').Writable

test('string multi', function(t) {
  t.plan(1);

  var tmpl = streamstache('<div>{foo}</div><div>{bar}</div>');
  tmpl.set('foo', 'ohhai');

  setTimeout(function() {
    tmpl.set('bar', 'ohhai');
  }, 100);

  tmpl.pipe(ws(function (html) {
    t.equal(html, '<div>ohhai</div><div>ohhai</div>');
  }));
});

function ws (fn) {
  var s = Writable();
  var buf = [];
  s._write = function(chunk, _, cb) {
    buf.push(chunk);
    cb();
  }
  s.on('finish', function() {
    fn(buf.join(''));
  });
  return s;
}