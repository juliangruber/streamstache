var Readable = require('readable-stream/readable.js');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var isarray = require('isarray');

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
      if (self.hasOwnProperty(key)) return;
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
 
  var top = self.stack[self.stack.length-1];
  var isEnum = s._readableState.objectMode;
  if (isEnum) {
    if (!top) return true;
    top.stream = typeof s.read != 'function'
      ? Readable().wrap(s)
      : s
    ;
    top.times = 0;
    top.index = self.idx;
    top.stream.on('end', function () {
      top.ended = true;
      if (top._waiting) top._waiting();
    });
    return true;
  }

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
      top = { id: id, show: top.show };
      self.stack.push(top);
    } else if (/{\//.test(token)) {
      if (top.id !== id) {
        return self.emit('error', new Error(
          "Closing token name doesn't match opening token name at this scope."
          + '\nExpected: ' + id
          + '\nActual: ' + top.id
        ));
      }
      if (top.scopes && top.scopes.length) {
        top.scope = top.scopes.shift();
        self.idx = top.index;
      } else if (top.stream && !top.ended) {
        self.idx = top.index;
        top.scope = null;
      } else {
        self.stack.pop();
        continue;
      }
    }
 
    if (top.show === false) continue;
    if (top.stream && !top.scope) return (function onread() {
      if (top._waiting) {
        top._waiting = null;
        top.ended = true;
        top.show = false;
        return self._parse();
      }
 
      if (top.ended) return self._parse();
      var row = top.stream.read();
      if (top.times++ !== 0 && row === null) {
        top.ended = true;
        top.show = false;
        return self._parse();
      }
      if (!row) {
        top._waiting = onread;
        return top.stream.once('readable', onread);
      }
      top.scope = row;
      
      var v = self._lookup(id);
      if (push(v)) self._parse();
    })(true);
 
    var v = self._lookup(id);
    if (typeof v != 'undefined') {
      if (!push(v)) break;
      continue;
    }

    self.waiting++;
    self.ee.once(id, function(value) {
      self.waiting--;
      push(value);
    });
    return;
  }

  if (self.idx >= self.tokens.length) self.push(null);
 
  function push(v) {
    var top = self.stack[self.stack.length-1] || {};
    if (top.show === false || top.ended) {
      return true;
    } else if (isStream(v)) {
      return self.stream(v);
    } else if (/^{#/.test(token)) {
      if (isarray(v) && v.length) {
        top.scopes = v.slice();
        top.index = self.idx;
        if (v.length > 0) {
          top.scope = top.scopes.shift();
        }
      } else if (isarray(v)) {
        top.show = false;
      } else if (top.show !== false) {
        top.show = Boolean(v);
      }
    } else if (top.show !== false && !/^{\//.test(token)) {
      if (typeof v !== 'string') v = String(v);
      return self.push(v);
    }
    return true;
  }
};

streamstache.prototype._read = function() {
  if (this.parsing || this.streaming || this.waiting) return;
  if (this.idx >= this.tokens.length - 1) return this.push(null);

  this.parse();
};

streamstache.prototype.set = function(key, value) {
  if (isStream(value)) {
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

streamstache.prototype._lookup = function(id) {
  for (var i = this.stack.length - 1; i >= 0; i--) {
    var sc = this.stack[i].scope;
    if (sc && {}.hasOwnProperty.call(sc, id)) {
      return sc[id];
    }
  }
  return this.scope[id];
};

function isStream(s) {
  return s && typeof s.pipe === 'function';
}
