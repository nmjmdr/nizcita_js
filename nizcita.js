const cbuff = require('./limit-buffer')

async function invoke(primary,alternate) {
  if(this.flipped) {
    onInvokeAlternate.bind(this)
    return await alternate()
  }
  onInvokePrimary.bind(this)()
  try {
    return await primary()
  } catch (err) {
    onPrimaryError.bind(this)(err)
    return await alternate()
  }
}

function setShouldProbe(shouldProbe) {
  this.shouldProbe = shouldProbe
  return this
}

function onInvokeAlternate() {
  this.numberOfCallsWhileFlipped++
}

function onInvokePrimary() {
  this.numberOfCallsWhileFlipped = 0
}

function onPrimaryError(err) {
  this.buf.push({
    error: err,
    failureType: 'exception'
  })
  this.numberOfPrimaryFailures = this.numberOfPrimaryFailures + 1
  this.flipped = this.shouldFlip(this.buf.getEnumerator(),this.numberOfPrimaryFailures)
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
    numberOfPrimaryFailures: 0,
    numberOfCallsWhileFlipped: 0,
    shouldProbe: () => {
      return true
    },
    setShouldProbe: setShouldProbe,
  }
}

module.exports = {
  circuitbreaker: circuitbreaker
}
