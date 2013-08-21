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

  var self = this;
  self.ee = new EventEmitter;
  self.tokens = tpl.split(/[{}]/);
  self.idx = -1;
  self.scope = {};
  self.waiting = 0;
  self.reading = false;

  if (scope) {
    Object.keys(scope).forEach(function(key) {
      self.set(key, scope[key]);
    });
  }

  if (Object.defineProperty) {
    for (var i = 1; i < self.tokens.length; i += 2) (function (key) {
      if (self[key]) throw new Error('reserved key: ' + key);
      Object.defineProperty(self, key, {
        get: function() { return self.get(key) },
        set: function(value) { self.set(key, value) }
      });
    })(self.tokens[i]);
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
      // this is messed up
      self.push('');
      self.read(0);
    });
  }
  if (self.stream) return;

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
          // this is messed up
          self.push();
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
