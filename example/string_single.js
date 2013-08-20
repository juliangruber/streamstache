var streamstache = require('..');
var fs = require('fs');

var tmpl = streamstache(fs.readFileSync(__dirname + '/string_single.html'));
tmpl.set('foo', 'bar');

tmpl.pipe(process.stdout);