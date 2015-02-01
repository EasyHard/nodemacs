var Readable = require('stream').Readable;
var util = require('util');

function MockReadable(options) {
  options = options || {};
  MockReadable.super_.call(this, options);
  this.fns = options.fns || [];
};
util.inherits(MockReadable, Readable);

MockReadable.prototype.delay = function delay(ms) {
  this.add(function (cb) {
    setTimeout(function () {
      cb(null);
    }, ms);
  });
};

MockReadable.prototype.add = function add(fn) {
  if (fn.constructor === Function) {
    this.fns.push(fn);
  } else {
    // assume fn is a value
    this.fns.push(function (cb) {
      cb(null, fn);
    });
  }
};

function iterateFns(fns, cb) {
  if (fns.length === 0) {
    cb(new Error('fns is empty'));
  } else {
    var fn = fns.shift();
    fn(function (err, value) {
      if (err) return cb(err);
      if (value) return cb(null, value);
      iterateFns(fns, cb);
    });
  }
}

MockReadable.prototype._read = function _read(size) {
  if (this.fns.length) {
    var self = this;
    iterateFns(this.fns, function (err, value) {
      if (err) {
        self.push(null);
      } else {
        self.push(value);
      }
    });
  } else {
    this.push(null);
  }
};

module.exports = MockReadable;
