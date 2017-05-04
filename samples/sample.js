const nz = require('../nizcita')

async function option1(value) {
  if(value % 2 === 0) {
    return Promise.resolve("option1: ok")
  } else {
    return Promise.reject("option1: failed")
  }
}

async function option2(value) {
  return Promise.resolve("option2: ok")
}


let cb = nz.circuitbreaker(100,(points)=>{
  console.log("should flip: ", points)
  return true
})


async function main() {
  let i = 3

  let primary = async function(){
    return await option1(i)
  }

  let alternate = async function(){
    return await option2(i)
  }

  let result = await cb.invoke(primary,alternate)
  console.log(result)

  result = await cb.invoke(primary,alternate)
  console.log(result)
}

main()
