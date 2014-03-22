var streamstache = require('..');
var test = require('tape');
var concat = require('concat-stream');

test('array loop', function(t) {
  t.plan(1);
  var tmpl = streamstache(
    '<div>{#critters}'
    + 'The {name} says {msg}.\n' 
    + '{/critters}</div>'
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

test('array with nested booleans', function(t) {
  t.plan(1);
  var tmpl = streamstache(
    '<div>{#critters}'
    + '{#show}'
    + 'The {name} says {msg}.\n' 
    + '{/show}'
    + '{/critters}</div>'
  );
  tmpl.set('critters', [
    { name: 'cow', msg: 'moo', show: true },
    { name: 'crow', msg: 'caw', show: false },
    { name: 'human', msg: 'blorp', show: true }
  ]);
  tmpl.pipe(concat(function (src) {
    t.equal(src.toString('utf8'), '<div>'
      + 'The cow says moo.\n'
      + 'The human says blorp.\n'
    + '</div>');
  }));
});
