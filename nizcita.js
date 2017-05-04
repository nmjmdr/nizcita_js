const buffer = require('./circular-buffer')

async function invoke(primary,alternate) {
  if(this.flipped) {
    return await alternate()
  }

  try {
    return await primary()
  } catch (err) {
    this.points.push({
      error: err,
      failureType: 'exception'
    })
    this.numberOfPrimaryFailures = this.numberOfPrimaryFailures + 1
    this.flipped = this.shouldFlip(this.points,this.numberOfPrimaryFailures)
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
    points: [],
    shouldFlip: shouldFlip,
    invoke: invoke,
    numberOfPrimaryFailures: 0
  }
}

module.exports = {
  circuitbreaker: circuitbreaker
}
