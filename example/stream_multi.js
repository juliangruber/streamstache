var streamstache = require('..');
var fs = require('fs');

var tmpl = streamstache(fs.readFileSync(__dirname + '/multi.html'));
tmpl.set('foo', fs.createReadStream(__dirname + '/single.html'));

setTimeout(function() {
  tmpl.set('bar', fs.createReadStream(__dirname + '/single.html'));
}, 500);

tmpl.pipe(process.stdout);