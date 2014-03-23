var streamstache = require('..');
var test = require('tape');
var Readable = require('readable-stream').Readable;
var Writable = require('readable-stream').Writable;
var concat = require('concat-stream');

test('nested object streams', function(t) {
  t.plan(1);

  var tmpl = streamstache(
    '<div>{#critters}'
    + '<h1>{name}</h1>\n'
    + '{#eats}'
    + 'The {name} eats {food}.\n'
    + '{/eats}'
    + '{/critters}</div>'
  );
  tmpl.set('critters', critters());

  tmpl.pipe(concat(function (html) {
    t.equal(
      html.toString('utf8'),
      '<div>'
      + '<h1>cat</h1>\n'
      + 'The cat eats mice.\n'
      + 'The cat eats tuna.\n'
      + '<h1>racoon</h1>\n'
      + 'The racoon eats garbage.\n'
      + '<h1>polar bear</h1>\n'
      + 'The polar bear eats beluga whales.\n'
      + 'The polar bear eats narwhals.\n'
      + 'The polar bear eats people.\n'
      + '</div>'
    );
  }));
});

function critters () {
  var s = Readable({ objectMode: true });
  s._read = function() {
    s.push({ name: 'cat', eats: food([ 'mice', 'tuna' ]) });
    s.push({ name: 'racoon', eats: food([ 'garbage' ]) });
    s.push({
      name: 'polar bear',
      eats: food([ 'beluga whales', 'narwhals', 'people' ])
    });
    s.push(null);
  };
  return s;
}

function food (names) {
  var foods = Readable({ objectMode: true });
  for (var i = 0; i < names.length; i++) {
    foods.push({ food: names[i] });
  }
  foods.push(null);
  return foods;
}
