const cbuff = require('./limit-buffer.js')
const _probePolicy = require('./probe-policies')

async function invoke(primary,alternate) {
  if(this.flipped && !this.shouldProbe(this.whileFlipped)) {
    return await invokeAlternate.bind(this)(alternate)
  }

  try {
    return await invokePrimary.bind(this)(primary)
  } catch (err) {
    onPrimaryError.bind(this)(err)
    return await invokeAlternate.bind(this)(alternate)
  }
}

async function invokeAlternate(alternate) {
  onInvokeAlternate.bind(this)()
  return await alternate()
}

async function invokePrimary(primary) {
  onInvokePrimary.bind(this)()
  return await primary()
}

function probePolicy(shouldProbe) {
  this.shouldProbe = shouldProbe
  return this
}

function onInvokeAlternate() {
  this.whileFlipped.calls++
}

function onInvokePrimary() {
  this.whileFlipped.calls = 0
}

function onPrimaryError(err) {
  this.failures.latestfailures.push({
    error: err,
    failureType: 'exception',
    failedAt: Date.now(),
  })
  // TO DO: change to idea of continous failures count -->
  // reset to counter: continousFailureCount
  this.failures.continousFailureCount = this.failures.continousFailureCount + 1
  this.flipped = this.shouldFlip(this.failures)
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

function circuitbreaker(bufferSz,shouldFlip) {
  return {
    flipped: false,
    shouldFlip: shouldFlip,
    invoke: invoke,
    failures: {
      continousFailureCount: 0,
      latestfailures: cbuff.create(bufferSz)
    },
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
