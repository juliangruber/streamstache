var streamstache = require('..');
var test = require('tape');
var Readable = require('readable-stream').Readable;
var Writable = require('readable-stream').Writable;
var concat = require('concat-stream');

test('stream each', function(t) {
  t.plan(1);

  var tmpl = streamstache(
    '<div>{#shoutz}'
    + '{word} to your {mother}\n'
    + '{/shoutz}</div>'
  );
  tmpl.set('shoutz', rs());

  tmpl.pipe(concat(function (html) {
    t.equal(
      html.toString('utf8'),
      '<div>'
      + 'word to your mother\n'
      + 'fodder to your cliche\n'
      + 'e to your iπ\n'
      + '</div>'
    );
  }));
});

function rs () {
  var s = Readable({ objectMode: true });
  s._read = function() {
    s.push({ word: 'word', mother: 'mother' });
    s.push({ word: 'fodder', mother: 'cliche' });
    s.push({ word: 'e', mother: 'iπ' });
    s.push(null);
  };
  return s;
}
