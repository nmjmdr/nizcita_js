const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const lbuff = require('../limit-buffer')
const expect = chai.expect
chai.use(chaiAsPromised)

describe('Using circular-buffer',()=>{
  const bufferSize = 10
  let buf
  beforeEach(()=>{
    buf = lbuff.create(bufferSize)
  })
  describe('When number of items equal to buffer size are added',()=>{
    it('Should store all the items added',()=>{
      for(let i=0;i<bufferSize;i++){
        buf.push(i)
      }
      let enumerator = buf.getEnumerator()
      for(let i=bufferSize-1;i>=0;i--){
        let value = enumerator.get()
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
        let value = enumerator.get()
        expect(value).to.equal(i)
      }
    })
  })

  describe('When enumerator is obtained multiple times',()=>{
    it('Should iterate the items successfully multiple times',()=>{
      let delta = 3
      for(let i=0;i<bufferSize+delta;i++){
        buf.push(i)
      }
      let enumerator = buf.getEnumerator()
      for(let i=bufferSize+delta-1;i>=delta;i--){
        enumerator.get()
      }

      enumerator = buf.getEnumerator()
      for(let i=bufferSize+delta-1;i>=delta;i--){
        let value = enumerator.get()
        expect(value).to.equal(i)
      }
    })
  })

  describe('When number of items less than the buffer size are added',()=>{
    it('Should store only the number of items that are added',()=>{
      let delta = 3
      for(let i=0;i<bufferSize-delta;i++){
        buf.push(i)
      }
      let enumerator = buf.getEnumerator()
      for(let i=bufferSize-delta-1;i>=0;i--){
        let value = enumerator.get()
        expect(value).to.equal(i)
      }
    })
  })

  describe('When no items are added to buffer',()=>{
    it('Should return null when get is invoked',()=>{
      let enumerator = buf.getEnumerator()
      expect(enumerator.get()).to.be.not.ok
    })
  })
})
