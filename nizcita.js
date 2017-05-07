const cbuff = require('./limit-buffer.js')
const _probePolicy = require('./probe-policies')

const FailureTypes = {
  Exception: 'exception',
  TimeTakenExceededLimit: 'time-taken-exceeded-limit'
}

async function invoke(primary,alternate) {
  if(this.flipped && !this.shouldProbe(this.whileFlipped)) {
    return await invokeAlternate.bind(this)(alternate)
  }

  try {
    let startTime = onBeforePrimaryCall.bind(this)()
    let result = await primary()
    onAfterPrimaryCall.bind(this)(startTime)
    return result
  } catch (err) {
    onPrimaryError.bind(this)(err,FailureTypes.Exception)
    return await invokeAlternate.bind(this)(alternate)
  }
}

function onBeforePrimaryCall() {
  this.whileFlipped.calls = 0
  return process.hrtime()
}

function onAfterPrimaryCall(startTime) {
  this.failures.continousFailureCount = 0
  let diff = process.hrtime(startTime)
  let timeTaken = diff[0] * 1e9 + diff[1]
  if(this.timeLimit && timeTaken > this.timeLimit) {
    onPrimaryError(new Error('Primary call took more than the limit'),FailureTypes.TimeTakenExceededLimit)
  }
}

async function invokeAlternate(alternate) {
  this.whileFlipped.calls++
  return await alternate()
}

async function invokePrimary(primary) {
  this.whileFlipped.calls = 0
  let result = await primary()
  this.failures.continousFailureCount = 0
  return result
}

function probePolicy(shouldProbe) {
  this.shouldProbe = shouldProbe
  return this
}



function onPrimaryError(err,failureType) {
  this.failures.continousFailureCount = this.failures.continousFailureCount + 1
  this.failures.latestfailures.push({
    error: err,
    failureType: failureType,
    failedAt: Date.now(),
  })

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

function setTimeLimit(timeLimit) {
  this.timeLimit = timeLimit
  return this
}

function circuitbreaker(bufferSz,shouldFlip) {
  return {
    flipped: false,
    shouldFlip: shouldFlip,
    invoke: invoke,
    timeLimit: null,
    setTimeLimit: setTimeLimit,
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
