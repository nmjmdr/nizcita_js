function random() {
  return Math.random() > 0.5? true : false
}

function never() {
  return false
}

function afterNFailures(afterN) {
  return function(whileFlipped) {
    return whileFlipped.calls > afterN
  }
}

function afterTime(deltaTicks) {
  return function(whileFlipped) {
    return (Date.now() - whileFlipped.flippedAt) >= deltaTicks
  }
}

module.exports = {
  random: random,
  never: never,
  afterNFailures: afterNFailures,
  afterTime: afterTime
}
