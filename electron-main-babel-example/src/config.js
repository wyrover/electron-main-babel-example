import fs from 'fs'

function getConfig (filename) {
  let data = fs.readFileSync(filename)
  return JSON.parse(data)
}

function writeConfig (filename, conf) {
  const jsonString = JSON.stringify(conf, null, 2)
  fs.writeFileSync(filename, jsonString)
}

export default {
  getConfig,
  writeConfig
}
