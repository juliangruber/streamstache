var streamstache = require('..');
var test = require('tape');
var concat = require('concat-stream');

test('array loop', function(t) {
  t.plan(1);
  var tmpl = streamstache(
    '<div>{#critters}'
    + 'The {name} says {msg}.\n' 
    + '{/critter}</div>'
  );
  tmpl.set('critters', [
    { name: 'cow', msg: 'moo' },
    { name: 'crow', msg: 'caw' },
    { name: 'human', msg: 'blorp' }
  ]);
  tmpl.pipe(concat(function (src) {
    t.equal(src.toString('utf8'), '<div>'
      + 'The cow says moo.\n'
      + 'The crow says caw.\n'
      + 'The human says blorp.\n'
    + '</div>');
  }));
});
