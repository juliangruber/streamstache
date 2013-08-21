var streamstache = require('..');
var test = require('tape');

test('getters', function(t) {
  var tmpl = streamstache('<div>{foo}</div>');
  tmpl.set('foo', 'ohhai');
  t.equal(tmpl.foo, 'ohhai');
  t.end();
});