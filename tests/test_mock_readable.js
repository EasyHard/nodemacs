var assert = require('chai').assert;
var MockReadable = require('./mock_readable');
var nDone = require('./util').nDone;
describe('MockReadable', function () {
  beforeEach(function (done) {
    this.mock = new MockReadable();
    done();
  });

  it('add value & end', function (done) {
    var value = 'test';
    done = nDone(2, done);
    this.mock.add(value);
    this.mock.on('data', function (data) {
      assert.equal(data, value);
      done();
    });
    this.mock.on('end', done);
  });

  it('add values & end', function (done) {
    var values = ['t1', 't2'];
    var mock = this.mock;
    values.forEach(function (item) {
      mock.add(item);
    });
    var datas = [];
    this.mock.on('data', function (data) {
      datas.push(data.toString('utf-8'));
    });
    this.mock.on('end', function () {
      assert.deepEqual(datas, values);
      done();
    });
  });

  it('delay', function(done) {
    done = nDone(2, done);
    var checked;
    setTimeout(function () {
      checked = true;
    }, 40);
    this.mock.delay(50);
    this.mock.add('string');
    this.mock.on('data', function (d) {
      assert.equal(d, 'string');
      assert.isTrue(checked);
      done();
    });
    this.mock.on('end', function (){
      done();
    });
  });

  it('object mode', function (done) {
    var mock = this.mock = new MockReadable({objectMode: true});
    var objs = [{a:1}, {b:2}, {c:3}];
    var rest = {d: 4};
    objs.forEach(mock.add.bind(mock));
    mock.delay(50);
    mock.add(rest);
    var datas = [];
    mock.on('data', function (data) {
      datas.push(data);
    });
    mock.on('end', function () {
      assert.deepEqual(datas, objs.concat(rest));
      done();
    });
  });

});
