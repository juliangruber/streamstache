var fs = require('fs');
var Stream = require('stream');
var Readable = Stream.Readable;
var PassThrough = Stream.PassThrough;
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
  this.waiting = 0;
}

inherits(streamstache, Readable);

// todo: memoize

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
      if (self.map[id] instanceof Stream) {
        self.map[id].resume();
        if (!self.push('<#Stream>')) return;
      } else {
        if (!self.push(self.map[id])) return;
      }
      continue;
    }

    self.waiting++;
    self.ee.once(id, function(value) {
      self.waiting--;
      self.push(value);
    });
    return;
  }
};

streamstache.prototype.set = function(key, value) {
  if (value instanceof Stream) value = pause(value);
  this.map[key] = value;
  this.ee.emit(key, value);
};

function pause(str) {
  var p = PassThrough();
  p.pause();
  return str.pipe(p);
}