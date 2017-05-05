const cbuff = require('./limit-buffer')
const _probePolicy = require('./probe-policies')

async function invoke(primary,alternate) {
  if(this.flipped && !this.shouldProbe(this.whileFlipped)) {
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

function probePolicy(shouldProbe) {
  this.shouldProbe = shouldProbe
  return this
}

function onInvokeAlternate() {
  this.whileFlipped.calls++
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
  if(this.flipped) {
    onFlipped.bind(this)()
  }
}

function onFlipped() {
  this.whileFlipped.flippedAt = Date.now()
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
    whileFlipped : {
      calls: 0,
      flippedAt: null
    },
    shouldProbe: () => _probePolicy.never,
    probePolicy: probePolicy,
  }
}

module.exports = {
  circuitbreaker: circuitbreaker
}
