var fs = require('fs');
var Stream = require('stream');
var Readable = Stream.Readable;
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
  this.reading = false;
}

inherits(streamstache, Readable);

// todo: memoize
streamstache.prototype._read = function(n) {
  var self = this;

  if (self.stream && !self.reading) {
    self.reading = true;
    self.stream.on('readable', function() {
      var buf = self.stream.read(n);
      if (buf) self.push(buf);
      else self.read();
    });
    self.stream.on('end', function() {
      self.stream = null;
      self.reading = false;
      self.read();
    });
    return;
  }

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
        return self.stream = self.map[id];
      } else {
        if (!self.push(self.map[id])) return;
      }
      continue;
    }

    self.waiting++;
    self.ee.once(id, function(value) {
      self.waiting--;
      if (value instanceof Stream) {
        self.stream = value;
        self.push('');
        self.read();
      } else {
        self.push(value);
      }
    });
    return;
  }
};

// todo: don't pause if used in same tick
streamstache.prototype.set = function(key, value) {
  if (value instanceof Stream) value.pause();
  this.map[key] = value;
  this.ee.emit(key, value);
};
