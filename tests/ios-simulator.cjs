const { default: Simctl } = require('node-simctl');
const { spawn } = require('node:child_process');

/**
 * @param {string} command
 */
function transformCommand(command) {
  const [cmd, ...args] = command.split(' ');
  return { cmd, args: args.filter((arg) => arg) };
}
/**
 * @param {string} command
 * @param {number} [timeout=300000]
 * @returns {Promise<ChildProcessWithoutNullStreams & { output: string }>}
 */
function spawnExec(command, timeout = 300000) {
  return new Promise((resolve, reject) => {
    const { cmd, args } = transformCommand(command);
    const proc = spawn(cmd, args);
    const clock = setTimeout(() => {
      console.log('timeout', timeout, command);
      proc.kill();
      reject(Error('Execution timeout'));
    }, timeout);
    let output = '';
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (data) => {
      output += data;
    });
    let error = '';
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', (err) => {
      error += err;
    });
    proc.on('close', (code) => {
      clearTimeout(clock);
      if (code) {
        reject(Error(error));
      } else {
        proc.output = output;
        resolve(proc);
      }
    });
  });
}

const iOSSimulatorSafari = function(args, logger, baseLauncherDecorator) {
  const log = logger.create('launcher:iOSSimulatorSafari');

  if (process.platform !== 'darwin') {
    log.error('This launcher only works in MacOS.');
    this._process.kill();
  }

  baseLauncherDecorator(this);

  const simctl = new Simctl();

  this.on('start', async(url) => {
    try {
      const devices = await simctl.getDevices(args.sdk, args.platform);
      log.info('all devices: ', devices);
      const device = devices.find(d => d.name === args.name);
      if (!device) {
        throw Error(`No device found for sdk ${args.sdk} with name ${args.name}`);
      }
      log.debug(`device: ${device.name} has been found`);
      simctl.udid = device.udid;

      if (device.state === 'Shutdown') {
        log.debug(`start to boot device: ${device.udid}`);
        await simctl.bootDevice();
        await simctl.startBootMonitor({ timeout: 1200000 });
        log.debug(`device: ${device.udid} has been booted`);
      }
      log.debug(`open url: ${url}`);
      return spawnExec(`xcrun simctl openurl ${device.udid} "${url}"`);
      // return simctl.openUrl(url);
    } catch (error) {
      log.error('err,', error);
      this._process.exitCode = -1;
      this._process.kill();
    }
  });

  this._onProcessExit = (code, errorOutput) => {
    const { pid } = this._process;
    log.debug('pid %d exited with code %d and errorOutput %s', pid, code, errorOutput);
    this.kill();
  };

  this.on('kill', () => {
    if (this.error) {
      this._process.exitCode = -1;
    }
    process.exit();
  });
};

iOSSimulatorSafari.prototype = {
  name: 'iOSSimulatorSafari',
  DEFAULT_CMD: {
    darwin: '/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/Contents/MacOS/Simulator'
  },
  ENV_CMD: null
};

iOSSimulatorSafari.$inject = ['args', 'logger', 'baseBrowserDecorator'];

module.exports = {
  'launcher:iOSSimulatorSafari': ['type', iOSSimulatorSafari]
};
