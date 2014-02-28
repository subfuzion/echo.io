var defaultCapacity = 100;

/**
 * A simple ring buffer specified with a particular capacity that can
 * return all the elements in last-to-first order
 * @type {exports}
 */
var RingBuffer = module.exports = function (capacity) {
  if (typeof capacity == 'undefined') capacity = defaultCapacity;
  if (capacity <= 0) throw new Error('capacity must be > 0');

  this._elements = new Array(capacity);

  // the head of the ring buffer points to the last element that was pushed
  this._head = 0;
  this._tail = 0;
  this._size = 0;
};

/**
 * The maximum capacity of the ring buffer
 * @returns {Number}
 */
RingBuffer.prototype.capacity = function () {
  return this._elements.length;
};

/**
 * The current number of elements stored in the ring buffer
 * @returns {number}
 */
RingBuffer.prototype.size = function () {
  return this._size;
};

/**
 * Peek at the head (newest) element
 */
RingBuffer.prototype.head = function () {
  return this._elements[this._head];
};

/**
 * Peek at the tail (oldest) element
 */
RingBuffer.prototype.tail = function () {
  return this._elements[this._tail];
};

/**
 * Peek at the element at the specified index
 * @param index 0 is the head element, 1 is previous, etc.
 */
RingBuffer.prototype.peek = function (index) {
  if (index >= this.size()) throw new Error('index out of range');
  var i = (index > this._head)
    ? this.capacity() - (index - this._head)
    : this._head - index;

  var element = this._elements[i];
  return element;
};

/**
 * Adds an element to the buffer. If the buffer is already at capacity,
 * then the element replaces the tail item (and tail is advanced).
 * @param element
 */
RingBuffer.prototype.push = function (element) {
  // advance the head pointer, handling ; if at capacity, the value
  // at tail will be overwritten
  this._head = (this._tail + this.size()) % this.capacity();
  this._elements[this._head] = element;

  // if at capacity, advance the tail pointer, otherwise increment size
  if (this.size() == this.capacity()) {
    this._tail = (this._tail + 1) % this.capacity();
  } else {
    this._size++;
  }
};

/**
 * Returns a new array of the elements in last-to-first order
 */
RingBuffer.prototype.toArray = function () {
  var size = this.size()
    , capacity = this.capacity()
    , results = new Array(size)
    , elements = this._elements
    , head = this._head
    , i
    ;

  for (i = 0; i < size; i++) {
    results[i] = elements[head];
    head--;
    // wrap back if necessary as we decrement toward tail
    if (head < 0) head = capacity - 1;
  }

  return results;
};

