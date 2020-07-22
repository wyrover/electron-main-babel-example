import { machineId } from 'node-machine-id'
import os from 'os'
import humanizeDuration from 'humanize-duration'
import prettysize from 'prettysize'
import si from 'systeminformation'

async function getINFO () {
  const id = await machineId()

  const cpus = { model: {}, speed: {} }
  for (let c = 0; c < os.cpus().length; c++) {
    cpus.model[os.cpus()[c].model] = (cpus.model[os.cpus()[c].model] || 0) + 1
    cpus.speed[os.cpus()[c].speed] = (cpus.speed[os.cpus()[c].speed] || 0) + 1
  }
  let osCPUs = { model: [], speed: [] }

  for (const p in cpus.model) osCPUs.model.push(cpus.model[p] + ' × ' + p)
  for (const p in cpus.speed) osCPUs.speed.push(cpus.speed[p] + ' × ' + p)
  osCPUs.model = osCPUs.model.join(', ')
  osCPUs.speed = osCPUs.speed.join(', ') + ' MHz'

  let tmpProcess = {}

  tmpProcess.rss = prettysize(process.memoryUsage().rss)
  tmpProcess.heapTotal = prettysize(process.memoryUsage().heapTotal)
  tmpProcess.heapUsed = prettysize(process.memoryUsage().heapUsed)

  let tmpSystem = await si.system()
  let tmpBIOS = await si.bios()
  let tmpBaseboard = await si.baseboard()
  let tmpChassis = await si.chassis()
  let tmpCPU = await si.cpu()

  let tmpGraphics = await si.graphics()
  let tmpOSinfo = await si.osInfo()

  let tmpDiskLayout = await si.diskLayout()

  return {
    machineId: id,
    os_homedir: os.homedir(),
    os_tmpdir: os.tmpdir(),
    os_hostname: os.hostname(),
    os_type: os.type(),
    os_platform: os.platform(),
    os_arch: os.arch(),
    os_release: os.release(),
    os_uptime: humanizeDuration(os.uptime() * 1000, { units: [ 'd', 'h', 'm' ], round: true }),
    os_cpus: osCPUs,
    os_totalmem: prettysize(os.totalmem()),
    os_freemem: prettysize(os.freemem()),
    os_freemempercent: Math.round(os.freemem() / os.totalmem() * 100),
    os_networkInterfaces: os.networkInterfaces(),
    process: tmpProcess,
    system: tmpSystem,
    bios: tmpBIOS,
    baseboard: tmpBaseboard,
    chassis: tmpChassis,
    cpu: tmpCPU,
    graphics: tmpGraphics,
    osInfo: tmpOSinfo,
    diskLayout: tmpDiskLayout

  }
}

export default {
  getINFO
}
