var Q = require('q');
var JsonParseStream = require('./json_parse_stream');
var PromisedStream = require('./promised_stream');
function Elisp(options) {
  var options = options || {};
  this.instStream = options.instStream || process.stdin;
  this.jsonStream = new JsonParseStream();
  this.promisedStream = new PromisedStream(this.jsonStream);
  this.instStream.pipe(this.jsonStream);
  this.outputStream = options.outputStream || process.stdout;
}

Elisp.prototype.putMessage = function putMessage(message) {
  var str = JSON.stringify(message) + '\n';
  return Q.ninvoke(this.outputStream, 'write', str, 'utf-8');
};
