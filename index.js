var fs = require('fs');
var Readable = require('stream').Readable;
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

module.exports = streamstache;

function streamstache(tpl) {
  if (!(this instanceof streamstache)) return new streamstache(tpl);
  Readable.call(this);

  if (typeof tpl != 'string') tpl = tpl.toString();
  this.ee = new EventEmitter;
  this.tpl = tpl;
  this.idx = 0;
  this.map = {};
  this.waiting = false;
}

inherits(streamstache, Readable);

streamstache.prototype._read = function(n) {
  var self = this;

  if (self.waiting) return;
  if (self.idx >= this.tpl.length) return this.push(null);

  var range = self.tpl.slice(self.idx, self.idx + n);

  function match(reg) {
    var m = reg.exec(range);
    if (!m) return false;
    range = range.slice(m[0].length);
    self.idx += m[0].length;
    return m[1];
  }

  while(true) {
    var txt = match(/^([^{]+)/);
    if (txt) self.push(txt);

    var id = match(/^{([^}]+)}/);
    if (!id && !txt) return;
    if (!id) continue;

    if (typeof self.map[id] != 'undefined') {
      self.push(self.map[id]);
      continue;
    }

    self.waiting = true;
    self.ee.once(id, function(value) {
      self.waiting = false;
      self.push(value);
    });
    return;
  }
};

streamstache.prototype.set = function(key, value) {
  this.map[key] = value;
  this.ee.emit(key, value);
};