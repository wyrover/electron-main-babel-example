import { machineId } from 'node-machine-id'
import logger from '../logger'

const MiddlewareAPI = {
  add: function (args, callback) {
    callback(null, args[0] + args[1])
  },

  getMachineId: async function (args, callback) {
    const id = await machineId()
    logger.info('Hello world!')
    callback(null, id)
  }

}

export default MiddlewareAPI
