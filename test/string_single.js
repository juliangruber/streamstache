var streamstache = require('..');
var test = require('tape');
var Readable = require('readable-stream').Readable;
var Writable = require('readable-stream').Writable

test('string single', function(t) {
  t.plan(1);

  var tmpl = streamstache('<div>{foo}</div>');
  tmpl.set('foo', 'ohhai');

  tmpl.pipe(ws(function (html) {
    t.equal(html, '<div>ohhai</div>');
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