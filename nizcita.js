const buffer = require('./circular-buffer')

async function invoke(primary,alternate) {
  if(this.flipped) {
    console.log("flipped, invoking alternative")
    return await alternate()
  }

  try {
    return await primary()
  } catch (err) {
    this.points.push({
      error: err,
      failureType: 'exception'
    })

    this.flipped = checkpoint.bind(this)()
    return await alternate()
  }
}

function checkpoint() {
  return this.shouldFlip(this.points)
}

function alternate(alternative){
  this.alternative = alternative
  return this
}


function circuitbreaker(bufferSize,numFailures,shouldFlip) {
  return {
    flipped: false,
    points: [],
    numFailures: numFailures,
    shouldFlip: shouldFlip,
    invoke: invoke
  }
}

module.exports = {
  circuitbreaker: circuitbreaker
}
