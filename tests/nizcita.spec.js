const sinon = require('sinon')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const nz = require('../nizcita')
const expect = chai.expect
chai.use(chaiAsPromised)

describe('When circuit-breaker is setup',()=>{
  let cb = nz.circuitbreaker(1,1,(points)=>{
    return true
  })
  let primaryValue = 1
  let secondaryValue = 2
  let primary = async ()=>{
    return Promise.resolve(primaryValue)
  }
  let secondary = async ()=>{
    return Promise.resolve(secondaryValue)
  }

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
      primary = async ()=>{
        throw new Error("Error")
      }
    })
    describe('When invoked',()=>{
      it('Should return the result of secondary',async ()=>{
        let result = await cb.invoke(primary,secondary)
        expect(result).to.be.equal(secondaryValue)
      })
    })
  })
})
