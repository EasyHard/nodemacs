var assert = require('chai').assert;
var PromisedStream = require('../promised_stream');
var MockReadable = require('./mock_readable');
var nDone = require('./util').nDone;
describe('PromisedStream', function () {
  beforeEach(function (done) {
    this.mock = new MockReadable({objectMode: true});
    done();
  });

  it('read once', function (done) {
    var obj = {a: 1};
    this.mock.add(obj);
    var ps = new PromisedStream(this.mock);
    var p = ps.read();
    p.then(function (o) {
      assert.deepEqual(o, obj);
      done();
    }).done();
  });

  it('end', function (done) {
    var ps = new PromisedStream(this.mock);
    var p = ps.read();
    p.catch(function (reason) {
      assert.isNull(reason);
      done();
    });
  });

  it('read two', function (done) {
    var objs = [{a: 1}, {b:2}];
    done = nDone(objs.length, done);
    this.mock.add(objs[0]);
    this.mock.delay(50);
    this.mock.add(objs[1]);
    var ps = new PromisedStream(this.mock);
    var p = [];
    p.push(ps.read());
    p.push(ps.read());

    p.forEach(function (promise, index) {
      promise.then(function (o) {
        assert.deepEqual(o, objs[index]);
        done();
      });
    });
  });
});
