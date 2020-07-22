;(async () => {
  console.log('start service process')
  const serviceIndex = require('./service_index')
  serviceIndex.StartServer()
})()

process.on('SIGINT', () => {
  console.log('Thanks for CTRL+Cing, exiting...')
  process.exit(2)
})

process.on('exit', () => {
  console.log('EXITING!!!!')
})

process.on('uncaughtException', (e) => {
  console.log('uncaughtException', e)
  process.exit(99)
})
