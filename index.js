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
  self.tokens = tpl.split(/({[^}]+})/);
  self.idx = -1;
  self.scope = {};
  self.stack = [];
  self.waiting = 0;
  self.streaming = false;
  self.parsing = false;

  if (scope) {
    Object.keys(scope).forEach(function(key) {
      self.set(key, scope[key]);
    });
  }

  if (Object.defineProperty) {
    for (var i = 1; i < self.tokens.length; i += 2) (function (token) {
      if (/^{\/#/.test(token)) return;
 
      var key = token.replace(/^{(?:#|\/#)?/, '').replace(/}$/, '');
      if (self[key]) throw new Error('reserved key: ' + key);
      Object.defineProperty(self, key, {
        get: function() { return self.get(key) },
        set: function(value) { self.set(key, value) }
      });
    })(self.tokens[i]);
  }
}

inherits(streamstache, Readable);

streamstache.prototype.stream = function(s) {
  var self = this;
  self.streaming = true;
  s.on('readable', function() {
    var buf = s.read();
    if (buf) self.push(buf);
  });
  s.on('end', function() {
    self.streaming = false;
    self.parse();
  });
};

streamstache.prototype.parse = function() {
  this.parsing = true;
  this._parse();
  this.parsing = false;
};

streamstache.prototype._parse = function() {
  var self = this;
  while(++self.idx < self.tokens.length) {
    var token = self.tokens[self.idx];
    var top = self.stack[self.stack.length-1] || {};

    if (self.idx % 2 === 0) {
      if (top.show === false) continue;
      var text = token;
      if (!self.push(text)) break;
      continue;
    }
 
    var id = token.replace(/^{[#\/]?/, '').replace(/}$/, '');
 
    if (/{#/.test(token)) {
      top = { id: id };
      self.stack.push(top);
    } else if (/{\//.test(token)) {
      if (top.id !== id) {
        return self.emit('error', new Error(
          "Closing token name doesn't match opening token name at this scope."
          + '\nExpected: ' + id
          + '\nActual: ' + top.id
        ));
      }
      top = self.stack.pop();
    }
 
    var v = self.scope[id];
    if (typeof v != 'undefined') {
      if (v instanceof Stream) {
        return self.stream(v);
      } else if (/^{#/.test(token)) {
        top.show = Boolean(v);
        // loops would go here...
      } else if (top.show !== false && !/^{\//.test(token)) {
        if (typeof v !== 'string') v = String(v);
        if (!self.push(v)) break;
      }
      continue;
    }

    self.waiting++;
    self.ee.once(id, function(value) {
      var top = self.stack[self.stack.length-1] || {};
      self.waiting--;
      if (top.show === false) {
        // nop
      } else if (value instanceof Stream) {
        self.stream(value);
      } else if (typeof value === 'string') {
        self.push(value);
      } else {
        self.push(String(value));
      }
    });
    return;
  }

  if (self.idx >= self.tokens.length) self.push(null);
};

streamstache.prototype._read = function() {
  if (this.parsing || this.streaming || this.waiting) return;
  if (this.idx >= this.tokens.length - 1) return this.push(null);

  this.parse();
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
