var assert = require('assert')
  , _ = require('underscore')
  ;

describe('ring buffer test suite', function () {
  var RingBuffer = require('../lib/util/ringbuffer');

  it('should create a ring buffer with a default capacity of 100', function () {
    var rb = new RingBuffer();
    assert.equal(rb.capacity(), 100);
  });

  it('should throw when specifying an invalid capacity', function () {
    try {
      var rb = new RingBuffer(0);
    } catch (err) {
      assert(/^capacity/.test(err.message));
    }
  });

  it('should create a ring buffer with the specified capacity', function () {
    var capacity = 50;
    var rb = new RingBuffer(capacity);
    assert.equal(rb.capacity(), capacity);
  })

  it('should increase size as elements are pushed (but not greater than capacity)', function () {
    var capacity = 3;
    var rb = new RingBuffer(capacity);

    assert.equal(rb.size(), 0);
    assert.equal(rb.head(), null);
    assert.equal(rb.tail(), null);

    rb.push('element-1');
    assert(rb.size(), 1);

    rb.push('element-2');
    assert(rb.size(), 2);

    rb.push('element-3');
    assert(rb.size(), 3);

    // assert size won't continue to increase
    // (can't be greater than the capacity)
    rb.push('element-4');
    assert(rb.size(), rb.capacity());

    rb.push('element-5');
    assert(rb.size(), rb.capacity());
  });

  it('should return last pushed element for head', function () {
    var capacity = 3;
    var rb = new RingBuffer(capacity);

    rb.push('element-1');
    assert(rb.head(), 'element-1');

    rb.push('element-2');
    assert(rb.head(), 'element-2');

    rb.push('element-3');
    assert(rb.head(), 'element-3');

    rb.push('element-4');
    assert(rb.head(), 'element-4');

    rb.push('element-5');
    assert(rb.head(), 'element-5');
  });

  it('should return oldest element for tail', function () {
    var capacity = 3;
    var rb = new RingBuffer(capacity);

    rb.push('element-1');
    assert(rb.tail(), 'element-1');

    rb.push('element-2');
    assert(rb.tail(), 'element-1');

    rb.push('element-3');
    assert(rb.tail(), 'element-1');

    // should purge element-1 from buffer
    rb.push('element-4');
    assert(rb.tail(), 'element-2');

    // should purge element-2 from buffer
    rb.push('element-5');
    assert(rb.tail(), 'element-3');
  });

  it('should be able to peek at previous elements', function () {
    // prepare an array with 10 values to use for testing
    var a = _.range(10).map(function (val) { return 'element-' + val });

    // add to ringbuffer that can only hold 3 elements
    var rb = new RingBuffer(3);
    _.each(a, function (value) { rb.push(value) });

    // ensure that size only increased up to the capacity
    assert.equal(rb.size(), rb.capacity());

    // peek at all previous elements and verify
    for (var i = 0; i < rb.size(); i++) {
      var actual = rb.peek(i);
      var expected = a[a.length - 1 - i];
      assert.equal(actual, expected);
    }
  });

  it('should be able to return array in last-to-first order (buffer not full)', function () {
    // prepare an array with 3 values to use for testing
    var a = _.range(3).map(function (val) { return 'element-' + val });

    // add to ringbuffer that can only hold 10 elements
    var rb = new RingBuffer(10);
    _.each(a, function (value) { rb.push(value) });

    var history = rb.toArray();

    // peek at all previous elements and verify
    for (var i = 0; i < rb.size(); i++) {
      var actual = history[i];
      var expected = a[a.length - 1 - i];
      assert.equal(actual, expected);
    }
  });

  it('should be able to return array in last-to-first order (buffer full)', function () {
    // prepare an array with 10 values to use for testing
    var a = _.range(10).map(function (val) { return 'element-' + val });

    // add to ringbuffer that can only hold 3 elements
    var rb = new RingBuffer(3);
    _.each(a, function (value) { rb.push(value) });

    var history = rb.toArray();

    // peek at all previous elements and verify
    for (var i = 0; i < rb.size(); i++) {
      var actual = history[i];
      var expected = a[a.length - 1 - i];
      assert.equal(actual, expected);
    }
  });
});

