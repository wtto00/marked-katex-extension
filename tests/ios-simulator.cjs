const { default: Simctl } = require('node-simctl');

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
        await simctl.startBootMonitor();
        log.debug(`device: ${device.udid} has been booted`);
      }
      log.debug(`open url: ${url}`);
      return simctl.openUrl(url);
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
