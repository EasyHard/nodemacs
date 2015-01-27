var Q = require('q');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function PromisedStream(stream) {
    this.stream = stream;
    this.buffer = [];
    this.stop = false;
    var self = this;
    this.stream.on('error', function (error) {
	self.stop = true;
	self.reason = error;
	self.emit('progress');
    });
    this.stream.on('data', function (object) {
	self.buffer.push(object);
	self.emit('progress');
    });
    this.stream.on('end', function (reason) {
	self.stop = true;
        self.reason = reason || null;
//	self.reason = reason || new Error('stream emits end');;
	self.emit('progress');
    });
}
util.inherits(PromisedStream, EventEmitter);

PromisedStream.prototype.read = function read() {
    var self = this;
    var defer = Q.defer();
    if (this.buffer.length !== 0) {
	defer.resolve(this.buffer.shift());
    } else if (this.stop) {
	defer.reject(this.reason);
    } else {
	this.once('progress', function () {
            if (self.buffer.length !== 0) {
	        defer.resolve(self.buffer.shift());
            } else if (self.stop) {
	        defer.reject(self.reason);
            } else {
                defer.reject(new Error('I dont know whats wrong'));
            }
	});
    }
    return defer.promise;
}

module.exports = PromisedStream;