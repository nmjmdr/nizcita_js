const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const nz = require('../nizcita')
const expect = chai.expect
chai.use(chaiAsPromised)

describe('Using circuit-breaker',()=>{
  let cb
  let primaryValue = 1
  let secondaryValue = 2
  let primary = async ()=>{
    return Promise.resolve(primaryValue)
  }
  let secondary = async ()=>{
    return Promise.resolve(secondaryValue)
  }
  const errorPrimary = async ()=>{
    throw new Error("Error")
  }

  describe('When circuit-breaker is setup to flip after a failure',()=>{
    beforeEach(()=>{
      cb = nz.circuitbreaker(1,(enumerator,numberOfPrimaryFailures)=>{
        return true
      })
    })

    describe('When it is NOT flipped',()=>{
      describe('When invoked',()=>{
        it('Should invoke the primary',async ()=>{
          let result = await cb.invoke(primary,secondary)
          expect(result).to.be.equal(primaryValue)
        })
      })
    })

    describe('When primary invocation leads to an error',()=>{
      before(()=>{
        primary = errorPrimary
      })
      describe('When invoked',()=>{
        it('Should return the result of secondary',async ()=>{
          let result = await cb.invoke(primary,secondary)
          expect(result).to.be.equal(secondaryValue)
        })
      })
    })
  })

  describe('When circuit-breaker is set to flip after "n" failures',()=>{
    let bufferSize = 10
    let numFailures = 20
    beforeEach(()=>{
      cb = nz.circuitbreaker(bufferSize,(enumerator,numberOfPrimaryFailures)=>{
        return numberOfPrimaryFailures >= numFailures
      })
    })
    describe('When primary errors out for "n" invocations',()=>{
      it('Should be flipped',async ()=>{
        for(let i=0;i<numFailures;i++) {
          await cb.invoke(errorPrimary,secondary)
        }
        expect(cb.flipped).to.be.true
      })
    })

    describe('When primary is invoked for less than "n" invocations',()=>{
      it('Should NOT be flipped',async ()=>{
        for(let i=0;i<numFailures-1;i++) {
          await cb.invoke(errorPrimary,secondary)
        }
        expect(cb.flipped).to.be.false
      })
    })
  })

  describe('When circuit-breaker is setup to probe',()=>{
    let probeAfterCalls = 1
    before(()=>{
      cb = nz.circuitbreaker(1,(enumerator,numberOfPrimaryFailures)=>{
        return true
      }).probePolicy((flippedStats)=>{
        return flippedStats.calls >= probeAfterCalls
      })
    })
    it('Should probe after configured number of calls to alternate',async ()=>{
      let callsToSecondary = 0
      let callsToPrimary = 0
      let primary = async ()=>{
        callsToPrimary++
        if(callsToPrimary == 1) {
          throw new Error("error")
        } else {
          return Promise.resolve(primaryValue)
        }
      }
      let secondary = async ()=>{
        callsToSecondary++
        return Promise.resolve(secondaryValue)
      }
      let result = await cb.invoke(primary,secondary)

      expect(result).to.equal(secondaryValue)
      result = await cb.invoke(primary,secondary)
      expect(result).to.equal(primaryValue)
      expect(callsToPrimary).to.equal(2)
      expect(callsToSecondary).to.equal(1)
    })
  })
})
