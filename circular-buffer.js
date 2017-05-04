function create(bufferSize) {
  return {
    bufferSize: bufferSize,
    buf: new Array(bufferSize),
    counter: 0,
    push: function(item) {
      this.counter = ((this.counter + 1) % this.bufferSize)
      this.buf[this.counter] = item
    },
    get: function() {
      return this.buf
    }
  }
}

module.exports = {
  create: create
}
