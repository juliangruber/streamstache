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

test('array with nested arrays', function(t) {
  t.plan(1);
  var tmpl = streamstache(
    '<div>{#critters}'
    + '{#foods}'
    + 'The {name} eats {food}.\n' 
    + '{/foods}\n---\n'
    + '{/critters}</div>'
  );
  tmpl.set('critters', [
    { name: 'cow', foods: [ { food: 'grass' },  { food: 'clovers' } ] },
    { name: 'crow', foods: [ { food: 'bugs' }, { food: 'fish' } ] },
    { name: 'human', foods: [ { food: 'garbage' }, { food: 'plastic' } ] },
    { name: 'rock', foods: [] }
  ]);
  tmpl.pipe(concat(function (src) {
    t.equal(src.toString('utf8'), '<div>'
      + 'The cow eats grass.\n'
      + 'The cow eats clovers.\n'
      + '\n---\n'
      + 'The crow eats bugs.\n'
      + 'The crow eats fish.\n'
      + '\n---\n'
      + 'The human eats garbage.\n'
      + 'The human eats plastic.\n'
      + '\n---\n'
      + '\n---\n'
    + '</div>');
  }));
});
