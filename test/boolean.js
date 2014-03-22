var streamstache = require('..');
var test = require('tape');
var concat = require('concat-stream');

test('true block', function(t) {
  t.plan(1);
  var tmpl = streamstache('<div>{#beep}TRUE!{/beep}</div>');
  tmpl.set('beep', true);
  tmpl.pipe(concat(function (src) {
    t.equal(src.toString('utf8'), '<div>TRUE!</div>');
  }));
});

test('false block', function(t) {
  t.plan(1);
  var tmpl = streamstache('<div>{#boop}FALSE!{/boop}</div>');
  tmpl.set('boop', false);
  tmpl.pipe(concat(function (src) {
    t.equal(src.toString('utf8'), '<div></div>');
  }));
});

test('nested false block', function(t) {
  t.plan(1);
  var tmpl = streamstache('<div>{#n}NO{#y}YES{/y}{/n}</div>');
  tmpl.set('n', false);
  tmpl.set('y', true);
  tmpl.pipe(concat(function (src) {
    t.equal(src.toString('utf8'), '<div></div>');
  }));
});
