var Q = require('q');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function PromisedStream(stream) {
  this.stream = stream;
  this.buffer = [];
  this.deferBuffer = [];
  this.stop = false;
  var self = this;
  this.stream.on('error', function (error) {
    self.stop = true;
    self.reason = error;
    self.progress();
  });
  this.stream.on('data', function (object) {
    self.buffer.push(object);
    self.progress();
  });
  this.stream.on('end', function (reason) {
    self.stop = true;
    self.reason = reason || null;
    self.progress();
  });
}
util.inherits(PromisedStream, EventEmitter);

PromisedStream.prototype.progress = function progress() {
  while (this.deferBuffer.length !== 0) {
    var defer = this.deferBuffer.shift();
    if (this.buffer.length !== 0) {
      defer.resolve(this.buffer.shift());
    } else if (this.stop) {
      defer.reject(this.reason);
    } else {
      this.deferBuffer.unshift(defer);
      break;
    }
  }
};

PromisedStream.prototype.read = function read() {
  var self = this;
  var defer = Q.defer();
  this.deferBuffer.push(defer);
  this.progress();
  return defer.promise;
}

module.exports = PromisedStream;
