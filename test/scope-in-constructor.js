var streamstache = require('..');
var test = require('tape');
var Writable = require('readable-stream').Writable;

test('scope in constructor', function(t) {
  t.plan(1);

  var tmpl = streamstache('<div>{foo}</div><div>{bar}</div>', {
    'foo': 'ohhai',
    'bar': 'ohhai'
  });

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