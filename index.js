var Stream = require('stream');
var Readable = Stream.Readable
  || require('readable-stream/lib/_stream_readable');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

module.exports = streamstache;

function streamstache(tpl, scope) {
  if (!(this instanceof streamstache)) return new streamstache(tpl, scope);
  Readable.call(this);

  if (typeof tpl != 'string') tpl = tpl.toString();

  this.ee = new EventEmitter;
  this.tokens = tpl.split(/[{}]/);
  this.idx = -1;
  this.scope = {};
  this.waiting = 0;
  this.reading = false;

  if (scope) {
    var self = this;
    Object.keys(scope).forEach(function(key) {
      self.set(key, scope[key]);
    });
  }
}

inherits(streamstache, Readable);

streamstache.prototype._read = function(n) {
  var self = this;

  if (self.stream && !self.reading) {
    self.reading = true;
    self.stream.on('readable', function() {
      var buf = self.stream.read(n);
      if (buf) self.push(buf);
    });
    self.stream.on('end', function() {
      self.stream = null;
      self.reading = false;
      self.read();
    });
    return;
  }

  if (self.waiting) return;
  if (self.idx >= self.tokens.length) return self.push(null);

  while(++self.idx < self.tokens.length) {
    var token = self.tokens[self.idx];

    if (self.idx % 2 == 0) {
      var text = token;
      if (!self.push(text)) return;
    } else {
      var id = token;
      if (typeof self.scope[id] != 'undefined') {
        if (self.scope[id] instanceof Stream) {
          return self.stream = self.scope[id];
        } else {
          if (!self.push(self.scope[id])) return;
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
  }
};

streamstache.prototype.set = function(key, value) {
  if (value instanceof Stream) {
    if (typeof value.read != 'function') {
      var r = Readable();
      r.wrap(value);
      value = r;
    }
  }
  this.scope[key] = value;
  this.ee.emit(key, value);
};

streamstache.prototype.get = function(key) {
  return this.scope[key];
};
