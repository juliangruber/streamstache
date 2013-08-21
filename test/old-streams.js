var streamstache = require('..');
var test = require('tape');
var through = require('through');
var Writable = require('readable-stream').Writable;

test('old streams', function(t) {
  t.plan(1);

  var tmpl = streamstache('<div>{foo}</div>');
  tmpl.set('foo', rs());

  tmpl.pipe(ws(function (html) {
    t.equal(html, '<div>ohhai</div>');
  }));

  function rs () {
    var tr = through();
    process.nextTick(function() {
      tr.queue('oh');
      tr.queue('hai');
      tr.queue(null);
    });
    return tr;
  }

  function ws (fn) {
    var buf = [];
    return through(write, end);

    function write(chunk) {
      buf.push(chunk);
    }
    function end() {
      fn(buf.join(''));
    }
  }
});