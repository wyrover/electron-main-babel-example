import socketIo from 'socket.io'
import axios from 'axios'
import socketIOClient from 'socket.io-client'
import path from 'path'
import fs from 'fs'

function sleep (time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export function BindServer (server) {
  const io = socketIo(server)

  const getApiAndEmit = async socket => {
    try {
      const res = await axios.get(
        'https://www.baidu.com'
      ) // Getting the data from DarkSky
      socket.emit('FromAPI', res.data) // Emitting a new message. It will be consumed by the client
    } catch (error) {
      console.error(`Error: ${error.code}`)
    }
  }

  console.log('BindServer')

  let interval
  io.on('connection', (socket) => {
    console.log('New client connected')
    if (interval) {
      clearInterval(interval)
    }
    interval = setInterval(() => getApiAndEmit(socket), 10000)
    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  ;
  (async () => {
    await sleep(5000)

    console.log('client connection server')

    let options = {
    //   key: fs.readFileSync(path.join(__dirname, 'client1-key.pem')),
    //   cert: fs.readFileSync(path.join(__dirname, 'client1-crt.pem')),
      ca: fs.readFileSync(path.join(__dirname, 'ca-crt.pem')),
      rejectUnauthorized: true

    }
    const endpoint = 'https://localhost:5600'
    const socket = socketIOClient(endpoint, options)
    socket.on('FromAPI', data => {
      console.log(data)
    })
  })()
}
