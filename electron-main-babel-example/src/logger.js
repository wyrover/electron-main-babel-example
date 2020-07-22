// import path from 'path'
// import fs from 'fs'
// import pino from 'pino'

// const logFolder = path.join(__dirname, 'logs')
// console.log(logFolder)
// const logFile = 'console.log'
// const logFilePath = path.join(logFolder, logFile)
// if (!fs.existsSync(logFolder)) {
//   fs.mkdirSync(logFolder, { recursive: true })
// }
// fs.appendFileSync(logFilePath, '\n')

// export const logger = pino()
// // logger.level = 'debug'
// // logger.log = logger.debug

export default {
  info: console.log
}

// global.logger = logger
