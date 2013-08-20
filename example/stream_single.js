var streamstache = require('..');
var fs = require('fs');

var tmpl = streamstache(fs.readFileSync(__dirname + '/single.html'));
tmpl.set('foo', fs.createReadStream(__dirname + '/single.html'));

tmpl.pipe(process.stdout);