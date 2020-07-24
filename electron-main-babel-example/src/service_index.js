import config from './config'
import fs from 'fs'
import path from 'path'
import https from 'https'
import express from 'express'
import jayson from 'jayson'
import morgan from 'morgan'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import getPort from 'get-port'
import schedule from 'node-schedule'

import MiddlewareAPI from './server_api/middleware'
import utils from './utils'
// import report from './report'
// import osinfo from './osinfo'
import { db } from './kvdb'
import { BindServer } from './socket'

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

  app.use(helmet())
  app.use(morgan('dev'))
  app.use(cookieParser())
  app.use(cors())
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  )
  app.use(bodyParser.json({limit: '5mb'}))

  // ----------------------------------------------------------------------
  // express routes
  app.get('/', function (req, res) {
    return res.json({
      message: 'Hello World'
    })
  })

  app.post('/kv', async (req, res) => {
    try {
      const key = req.body.key
      const value = req.body.value
      await db.put(key, Buffer.from(value), { valueEncoding: 'binary' })
      return res.status(200).json({
        success: true,
        key: key,
        value: value
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        error: err,
        stackError: err.stack
      })
    }
  })

  app.get('/kv/:key', async (req, res) => {
    try {
      const key = req.params.key

      const value = await db.get(key, { valueEncoding: 'binary' })
      if (!value) {
        return res.status(404).json({
          success: false,
          data: 'key not exist'
        })
      } else {
        return res.status(200).json({
          success: true,
          value: value.toString()
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        error: err,
        stackError: err.stack
      })
    }
  })

  app.put('/kv/:key', async (req, res) => {
    try {
      const key = req.params.key
      const postValue = req.body.value

      const value = await db.get(key, { valueEncoding: 'binary' })
      if (!value) {
        return res.status(404).json({
          message: 'key not found.'
        })
      } else {
        await db.put(key, Buffer.from(postValue), { valueEncoding: 'binary' })
        return res.status(200).json({
          success: true,
          key: key,
          value: postValue
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        error: err,
        stackError: err.stack
      })
    }
  })

  app.delete('/kv/:key', async (req, res) => {
    try {
      const key = req.params.key
      const value = await db.get(key, { valueEncoding: 'binary' })
      if (!value) {
        return res.status(400).json({
          message: 'key not found.'
        })
      } else {
        await db.del(key)
        return res.status(204).json({
          success: true
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        error: err,
        stackError: err.stack
      })
    }
  })

  // ----------------------------------------------------------------------
  // jsonrpc routes

  app.post('/jsonrpc', jayson.server(MiddlewareAPI).middleware())

  app.use((req, res, next) => {
    return res.status(404).json({
      error: 'page not found!'
    })
  })

  const server = https.createServer(
    {
      requestCert: false,
      rejectUnauthorized: false,
      key: fs.readFileSync(path.join(__dirname, 'server-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'server-crt.pem')),
      ca: fs.readFileSync(path.join(__dirname, 'ca-crt.pem'))
    },
    app
  )

  BindServer(server)

  server.listen(conf.service.port, async () => {
    console.log(`Server is run on port ` + conf.service.port)
    // let info = await osinfo.getINFO()
    // report.serviceReport('electron_service', info)
  })

  // mylmdb.close()
}
