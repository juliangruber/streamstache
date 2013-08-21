var streamstache = require('..');
var test = require('tape');

test('get', function(t) {
  var tmpl = streamstache('<div>{foo}</div>');
  tmpl.set('foo', 'ohhai');
  t.equal(tmpl.get('foo'), 'ohhai');
  t.end();
});