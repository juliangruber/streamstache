var fs = require('fs');
var Readable = require('stream').Readable;
var inherits = require('util').inherits;

module.exports = streamstache;

function streamstache(tpl) {
  if (!(this instanceof streamstache)) return new streamstache(tpl);
  Readable.call(this);

  if (typeof tpl != 'string') tpl = tpl.toString();
  this.tpl = tpl;
  this.idx = 0;
  this.map = {};
  this.inId = false;
  this.id = '';
}

inherits(streamstache, Readable);

streamstache.prototype._read = function(n) {
  if (this.idx >= this.tpl.length) return this.push(null);

  do {
    var c = this.tpl[this.idx];
    if (c == '{') {
      this.inId = true;
    } else if (c == '}') {
      this.push(this.map[this.id]);
      this.inId = false;
      this.id = '';
    } else if (this.inId) {
      this.id += c;
    } else {
      this.push(c);
    }
  } while (this.idx++ < Math.min(this.idx + n, this.tpl.length))
};

streamstache.prototype.set = function(key, value) {
  this.map[key] = value;
};