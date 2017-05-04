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


function circuitbreaker(bufferSize,shouldFlip) {
  return {
    flipped: false,
    points: [],
    shouldFlip: shouldFlip,
    invoke: invoke
  }
}

module.exports = {
  circuitbreaker: circuitbreaker
}
