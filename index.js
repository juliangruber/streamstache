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
  this.waiting = false;
}

inherits(streamstache, Readable);

streamstache.prototype._read = function(n) {
  var self = this;

  if (this.waiting) return;

  if (this.idx >= this.tpl.length) return this.push(null);
  var range = this.tpl.slice(this.idx, this.idx + n);

  function match(reg) {
    var m = reg.exec(range);
    if (!m) return false;
    range = range.slice(m[0].length);
    self.idx += m[0].length;
    return m[1];
  }

  while (true) {
    var txt = match(/^([^{]+)/);
    if (txt) this.push(txt);

    var id = match(/^{([^}]+)}/);
    if (!id && !txt) return;
    if (!id) continue;

    if (typeof this.map[id] != 'undefined') {
      this.push(this.map[id]);
    } else {
      this.waiting = true;
      this.once(id, function(value) {
        this.waiting = false;
        this.push(value);
      });
      break;
    }
  }
};

streamstache.prototype.set = function(key, value) {
  this.map[key] = value;
  this.emit(key, value);
};