var streamstache = require('..');
var fs = require('fs');

var tmpl = streamstache(fs.readFileSync(__dirname + '/multi.html'));
tmpl.set('foo', 'bar');

setTimeout(function() {
  tmpl.set('bar', 'baz');
}, 500);

tmpl.pipe(process.stdout);