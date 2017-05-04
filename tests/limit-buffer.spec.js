const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const lbuff = require('../limit-buffer')
const expect = chai.expect
chai.use(chaiAsPromised)

describe('Using circular-buffer',()=>{
  let bufferSize = 10
  let buf = lbuff.create(bufferSize)

  describe.only('When number of items equal to buffer size are added',()=>{

    it('Should store all the items added',()=>{
      for(let i=0;i<bufferSize+2;i++){
        buf.push(i)
      }
      for(;;){
        let value = buf.enumerator().next()
        console.log(value)
        if(!value) {
          break
        }
      }
    })
  })


})
