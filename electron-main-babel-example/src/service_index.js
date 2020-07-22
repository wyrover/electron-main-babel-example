import config from './config'
import fs from 'fs'
import path from 'path'
import https from 'https'
import express from 'express'
import jayson from 'jayson'
import bodyParser from 'body-parser'
import cors from 'cors'
import getPort from 'get-port'
import schedule from 'node-schedule'
import MiddlewareAPI from './server_api/middleware'
import utils from './utils'
// import report from './report'
// import osinfo from './osinfo'
import { db } from './kvdb'

// const getIP = require('external-ip')()

let dir = path.join(__dirname, 'mydata')
console.log(dir)

const CONFIG_FILENAME = path.join(__dirname, './config.json')

const app = express()

export async function StartServer () {
  let conf = config.getConfig(CONFIG_FILENAME)

  console.log(conf.service.username)
  console.log(conf.service.password)

  // mylmdb.open()

  conf.service.port = await getPort()
  conf.service.port = 5600

  console.log(new Date(Date.now()))

  let date = new Date(Date.now() + utils.getRandomInt(60) * 1000)
  console.log(date)

  // 开机启动一分钟内随机调用
  schedule.scheduleJob(date, function () {
    console.log('执行任务:' + date)
  })

  let i = 0
  schedule.scheduleJob('*/10 * * * * *', () => {
    i++
    console.log('job runing' + i)
    // getIP((err, ip) => {
    //   if (err) {
    //     // every service in the list has failed
    //     throw err
    //   }
    //   console.log(ip)
    // })
  })

  // config.writeConfig(CONFIG_FILENAME, conf)

  // const clientAuthMiddleware = () => (req, res, next) => {
  //   if (!req.client.authorized) {
  //     return res.status(401).send('Invalid client certificate authentication.')
  //   }
  //   return next()
  // }

  // app.use(clientAuthMiddleware())

  app.use(cors())
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  )
  app.use(bodyParser.json())

  // ----------------------------------------------------------------------
  // express routes
  app.get('/', function (req, res) {
    res.send('Hello World')
  })

  app.get('/db/:key', async (req, res) => {
    let key = req.params.key
    try {
      const value = await db.get(key, { valueEncoding: 'binary' })
      res.send(value.toString())
    } catch (err) {
      res.send(err)
    }
  })

  app.get('/pdb/:key/:value', async (req, res) => {
    let key = req.params.key
    let value = req.params.value
    try {
      await db.put(key, Buffer.from(value), { valueEncoding: 'binary' })
      res.send(value)
    } catch (err) {
      res.send(err)
    }
  })

  app.delete('/db/:key', async (req, res) => {
    let key = req.params.key
    try {
      await db.del(key)
      res.send(key)
    } catch (err) {
      res.send(err)
    }
  })

  // ----------------------------------------------------------------------
  // jsonrpc routes

  app.post('/jsonrpc', jayson.server(MiddlewareAPI).middleware())

  https
    .createServer(
      {
        requestCert: false,
        rejectUnauthorized: false,
        key: fs.readFileSync(path.join(__dirname, 'server-key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'server-crt.pem')),
        ca: fs.readFileSync(path.join(__dirname, 'ca-crt.pem'))
      },
      app
    )
    .listen(conf.service.port, async () => {
      console.log(`Server is run on port ` + conf.service.port)
      // let info = await osinfo.getINFO()
      // report.serviceReport('electron_service', info)
    })

  // mylmdb.close()
}
