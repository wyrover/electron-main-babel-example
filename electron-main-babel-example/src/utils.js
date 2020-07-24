import ChildProcess from 'child_process'

function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max))
}

function spawnUpdate (exepath, args, cb) {
  var error = null
  var stdout = ''
  var updateProcess = null
  try {
    updateProcess = ChildProcess.spawn(exepath, args)
  } catch (e) {
    process.nextTick(function () {
      cb(e)
    })
  }

  updateProcess.stdout.on('data', function (data) {
    stdout += data
  })

  updateProcess.on('error', function (_error) {
    error = _error
  })
  updateProcess.on('close', function (code, signal) {
    if (code !== 0) {
      error = new Error('Command failed: #{signal ? code}')
      error.code = code
      error.stdout = stdout
    }

    cb(error, stdout)
  })
}

export default {
  getRandomInt,
  spawnUpdate
}
