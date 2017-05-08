## A circuit-breaker library for async-await invocations in Nodejs

Nizcita-js is [circuit-breaker](https://martinfowler.com/bliki/CircuitBreaker.html) library for invoking async-awit invocations in NodeJS.

The library is simple and provides flexibility to clients to decide the following aspects of a circuit-breaker:
1. When the circuit closes
2. When to probe if the main or the primary invocation is working fine (and the circuit can hence be flipped back to use the main/primary invocation)

##### To acheive aspect 1, nizcita:

* Maintains the information about _"n" latest failures_. The information is maintained in a limited circular buffer and can be enumerated by the client. 

* When setting up the circuit breaker, the client supplies a function. Nizcita invokes this function, when the primary invocation fails to determine if the circuit needs to be flipped to use the alternative invocation.

```javascript
const numFailures = 5
const holdNLatestFailures = 10
let cb = nz.circuitbreaker(holdNLatestFailures,(failuresInfo)=>{
        return failuresInfo.continousFailureCount >= numFailures
      })
```
In the above code, after there have been 5 continous failures, the client informs nizcita to flip the circuit.

This determination can also be done by enumerating all the failures.
```javascript
let cb = nz.circuitbreaker(bufferSize,(failuresInfo)=>{
        let enumerator = failuresInfo.getEnumerator()
        while(true) {
          let failure = enumerator.get()
          if(!failure) {
            break
          }
          // process the failure
        }
        return decision
      })
```

A failure can be of two types: _an exception_ or a _time limit exceeded_. The client set the limit on amount of time a primary invocation is expected to take. If the primary invocation take more time than this, nizcita treats it as failure and pushes it to the failures buffer.

The time limit can be set in the following manner:
```javascript
const numFailures = 5
const timeLimit = 2 * 1e6 // time limit is specified in nanoseconds
const holdNLatestFailures = 10
let cb = nz.circuitbreaker(holdNLatestFailures,(failuresInfo)=>{
        return failuresInfo.continousFailureCount >= numFailures
      })
      .setTimeLimit(timeLimit)
```
Time limit has to be specified as numerical value in nanoseconds.

Note: Nizcita currently does not support cancellation of the async primary invocation, as JS does not support it (unlike C#).

##### To acheive aspect 2, nizcita:
1. The client can set the probe policy. The probe policy is used nizcita to determine if to probe (or a canary call/test call) the primary after the circuit has been flipped.

The probe policy can be set in the following manner:
```javascript
let probeAfterCalls = 10
let cb = nz.circuitbreaker(1,(failures)=>{
        return true
      })
      .probePolicy((flippedStats)=>{
        return flippedStats.calls >= probeAfterCalls
      })
```
In the above code the client indicates that the probe should be done after "x" number of calls have been made to the "alternate".

The library comes with a few standard set of probe policies including: coin-flip and probablity-based

An example setup and use:

```javascript
const limitFailuresTo = 5
const timeLimit = 2 * 1e6
let cb = nz.circuitbreaker(100,(failuresInfo)=>{
  return failuresInfo.continousFailureCount > limitFailuresTo
})
.setTimeLimit(timeLimit)
.shouldProbe((flippedStats)=>{
  return (Date.now() - flippedStats.flippedAt) > 5
})

async function getOption() {
  let i = 3

  let primary = async function(){
    return await option1(i)
  }
  let alternate = async function(){
    return await option2(i)
  }
  let result = await cb.invoke(primary,alternate)
  console.log(result)
}
```

Nizcita in [Sanskrit](http://spokensanskrit.de/index.php?tinput=nizcita) is _decision_
