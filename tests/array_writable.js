var util = require('util');
var Writable = require('stream').Writable;
function ArrayWritable(options) {
  ArrayWritable.super_.call(this, options);
  this.buffer = [];
}
util.inherits(ArrayWritable, Writable);

ArrayWritable.prototype._write = function _write(chunk, encoding, cb) {
  this.buffer.push(chunk);
  cb(null);
};

module.exports = ArrayWritable;
