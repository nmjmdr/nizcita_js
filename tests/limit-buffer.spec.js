const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const lbuff = require('../limit-buffer')
const expect = chai.expect
chai.use(chaiAsPromised)

describe('Using circular-buffer',()=>{
  let bufferSize = 10
  let buf = lbuff.create(bufferSize)

  describe('When number of items equal to buffer size are added',()=>{
    it('Should store all the items added',()=>{
      for(let i=0;i<bufferSize;i++){
        buf.push(i)
      }
      let enumerator = buf.getEnumerator()
      for(let i=bufferSize-1;i>=0;i--){
        let value = enumerator.next()
        expect(value).to.equal(i)
      }
    })
  })

  describe('When number of items greater than the buffer size are added',()=>{
    it('Should store only "buffer size" number of items',()=>{
      let delta = 3
      for(let i=0;i<bufferSize+delta;i++){
        buf.push(i)
      }
      let enumerator = buf.getEnumerator()
      for(let i=bufferSize+delta-1;i>=delta;i--){
        let value = enumerator.next()
        expect(value).to.equal(i)
      }
    })
  })
})
