var ArrayWritable = require('./array_writable');
var assert = require('chai').assert;

describe('ArrayWritable', function () {
  beforeEach(function (done) {
    this.stream = new ArrayWritable();
    done();
  });
  it('write and check', function (done) {
    var stream = this.stream;
    var chunk = 'a\n';
    this.stream.write(chunk, 'utf-8', function (err) {
      assert.equal(stream.buffer[0], chunk);
      done();
    });
  });
})
