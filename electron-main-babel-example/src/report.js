/**
 * example:
 *
    let conf = {
    test1: '123',
    test2: '456',
    message: {
        data: `

        adsfadsfasdf

        `.trim()
    }
    }

    serviceReport('electron_service', JSON.stringify(conf))
 */

const crypto = require('crypto')
const axios = require('axios')
const _ = require('lodash')
// const iconv = require('iconv-lite')
const urlencode = require('urlencode')

function rc4Encrypt (key, plaintext) {
  let cipher = crypto.createCipheriv('rc4', key, '')
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
  return ciphertext
}

function rc4Decrypt (key, ciphertext) {
  let decipher = crypto.createDecipheriv('rc4', key, '')
  let text = decipher.update(ciphertext, 'hex', 'utf8')
  return text
}

// function urlencode (str) {
//   str = (str + '')
//   return encodeURIComponent(str)
//     .replace(/!/g, '%21')
//     .replace(/'/g, '%27')
//     .replace(/\(/g, '%28')
//     .replace(/\)/g, '%29')
//     .replace(/\*/g, '%2A')
//     .replace(/~/g, '%7E')
//     .replace(/%20/g, '+')
// }

function serviceReport (key, msg) {
  const pID = 99999
  const qID = 99999
  const bID = 99999
  const gameID = 99999
  const funID = 99999
  const orderID = 315704668
  const reserveID = 99999

  const dateTime = Date.now()
  const timestamp = Math.floor(dateTime / 1000)

  let text = ''
  if (_.isObject(msg)) {
    text = JSON.stringify(msg)
    console.log(text)
  }

  let value = urlencode(text, 'gbk')

  const params = `markProgramLog?p_id=${pID}&q_id=${qID}&b_id=${bID}&game_id=${gameID}&fun_id=${funID}&order_id=${orderID}&reserve_id=${reserveID}&key_string=${key}&time_stamp=${timestamp}&data=${value}`

  const pass = '!QAZXSW@'
  const pass2 = 'zuhaowan2016'

  console.log(params)

  let ciphertext = rc4Encrypt(pass, params)

  let reportURI = `http://www.zuhaowan.com/interfaceApi/Index?${ciphertext}`

  axios
    .get(
      reportURI
    )
    .then((res) => {
      const responseText = rc4Decrypt(pass2, res.data)
      const obj = JSON.parse(responseText)
      console.log(obj.msg)
    // console.log(res.data)
    })
}

export default {
  serviceReport
}
