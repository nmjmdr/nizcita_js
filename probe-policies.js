function coinToss() {
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

function randomProbability(p) {
  return Math.random() < p? true : false
}

module.exports = {
  coinToss: coinToss,
  randomProbability: randomProbability,
  never: never,
  afterNFailures: afterNFailures,
  afterTime: afterTime
}
