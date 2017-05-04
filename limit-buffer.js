function create(bufferSize) {
  return {
    bufferSize: bufferSize,
    buf: new Array(bufferSize),
    counter: 0,
    numberOfItems: 0,
    push: function(item) {
      this.buf[this.counter] = item
      this.counter = ((this.counter + 1) % this.bufferSize)
      this.numberOfItems++
      this.numberOfItems = this.numberOfItems > this.bufferSize ? this.bufferSize : this.numberOfItems
    },
    enumerator: function(){
      return {
        index: this.counter,
        iteration: 0,
        scope: this,
        next: function(){
          console.log(this)
          return null
        }
      }
    }
  }
}

module.exports = {
  create: create
}
