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
    getEnumerator: function(){
      return {
        index: this.counter,
        iteration: 0,
        scope: this,
        next: function(){
          if(this.numberOfItems === 0 || this.iteration === this.scope.numberOfItems) {
            return null
          }
          this.index--
          this.index = this.index < 0 ? (this.scope.bufferSize-1) : this.index
          this.iteration++
          return this.scope.buf[this.index]
        }
      }
    }
  }
}

module.exports = {
  create: create
}
