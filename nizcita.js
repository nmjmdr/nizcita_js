const cbuff = require('./limit-buffer')

async function invoke(primary,alternate) {
  if(this.flipped) {
    return await alternate()
  }

  try {
    return await primary()
  } catch (err) {
    this.buf.push({
      error: err,
      failureType: 'exception'
    })
    this.numberOfPrimaryFailures = this.numberOfPrimaryFailures + 1
    this.flipped = this.shouldFlip(this.buf.getEnumerator(),this.numberOfPrimaryFailures)
    return await alternate()
  }
}

function alternate(alternative){
  this.alternative = alternative
  return this
}

function circuitbreaker(bufferSize,shouldFlip) {
  return {
    flipped: false,
    buf: cbuff.create(bufferSize),
    shouldFlip: shouldFlip,
    invoke: invoke,
    numberOfPrimaryFailures: 0
  }
}

module.exports = {
  circuitbreaker: circuitbreaker
}
