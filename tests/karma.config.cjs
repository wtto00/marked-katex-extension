// Karma configuration
// Generated on Sun Aug 27 2023 21:47:29 GMT+0800 (中国标准时间)
const simctl = require('node-simctl');
const iosSimulator = require('appium-ios-simulator');

const log = require('karma/lib/logger').create('launcher:MobileSafari');

const launchers = {
  Safari_IOS_9: {
    base: 'MobileSafari',
    name: 'iPhone 5s',
    platform: 'iOS',
    sdk: '9.0'
  },
  Safari_IOS_10: {
    base: 'MobileSafari',
    name: 'iPhone 5s',
    platform: 'iOS',
    sdk: '10.0'
  },
  Safari_IOS_12: {
    base: 'MobileSafari',
    name: 'iPhone 5s',
    platform: 'iOS',
    sdk: '12.4'
  },
  Safari_IOS_13: {
    base: 'MobileSafari',
    name: 'iPhone 8',
    platform: 'iOS',
    sdk: '13.7'
  },
  Safari_IOS_14: {
    base: 'MobileSafari',
    name: 'iPhone 8',
    platform: 'iOS',
    sdk: '14.4'
  },
  Safari_IOS_15_0: {
    base: 'MobileSafari',
    name: 'iPhone 13',
    platform: 'iOS',
    sdk: '15.0'
  },
  Safari_IOS_15: {
    base: 'MobileSafari',
    name: 'iPhone 13',
    platform: 'iOS',
    sdk: '15.2'
  },
  SauceLabs_IE9: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    version: '9.0',
    platform: 'Windows 7'
  },
  SauceLabs_IE10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    version: '10.0',
    platform: 'Windows 7'
  },
  SauceLabs_IE11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    version: '11.0',
    platform: 'Windows 7'
  },
  SauceLabs_Edge18: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    version: '18.17763',
    platform: 'Windows 10'
  },
  SauceLabs_Android4: {
    base: 'SauceLabs',
    browserName: 'Browser',
    platform: 'Android',
    version: '4.4',
    device: 'Android Emulator'
  },
  SauceLabs_iOS10_3: {
    base: 'SauceLabs',
    browserName: 'Safari',
    platform: 'iOS',
    version: '10.3',
    device: 'iPhone 7 Plus Simulator'
  },
  SauceLabs_iOS9_3: {
    base: 'SauceLabs',
    browserName: 'Safari',
    platform: 'iOS',
    version: '9.3',
    device: 'iPhone 6 Plus Simulator'
  },
  IE_9: {
    base: 'IE',
    'x-ua-compatible': 'IE=EmulateIE9',
    flags: ['-extoff']
  },
  IE_10: {
    base: 'IE',
    'x-ua-compatible': 'IE=EmulateIE10',
    flags: ['-extoff']
  },
  IE_11: {
    base: 'IE',
    flags: ['-extoff']
  },
  Safari_Stable: {
    base: 'SafariNative'
  },
  Chrome_Stable: {
    base: 'ChromeHeadless'
  },
  Firefox_Stable: {
    base: 'Firefox'
  }
};
const ciLauncher = launchers[process.env.TARGET_BROWSER];

const customLaunchers = ciLauncher
  ? { target_browser: ciLauncher }
  : {
    // stable_chrome: {
    //   base: 'ChromeHeadless'
    // },
    // stable_firefox: {
    //   base: 'Firefox'
    // }
    local_edge: {
      base: 'Edge'
    }
  };
const MobileSafari = function(baseBrowserDecorator, args) {
  if (process.platform !== 'darwin') {
    log.error('This launcher only works in MacOS.');
    this._process.kill();
    return;
  }
  baseBrowserDecorator(this);
  this.on('start', url => {
    simctl.getDevices(args.sdk, args.platform).then(devices => {
      const d = devices.find(d => {
        return d.name === args.name;
      });

      if (!d) {
        log.error(`No device found for sdk ${args.sdk} with name ${args.name}`);
        log.info('Available devices:', devices);
        this._process.kill();
        return;
      }

      return iosSimulator.getSimulator(d.udid).then(device => {
        return simctl.bootDevice(d.udid).then(() => device);
      }).then(device => {
        return device.waitForBoot(60 * 5 * 1000).then(() => {
          return device.openUrl(url);
        });
      });
    }).catch(e => {
      console.log('err,', e);
    });
  });
};

MobileSafari.prototype = {
  name: 'MobileSafari',
  DEFAULT_CMD: {
    darwin: '/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/Contents/MacOS/Simulator'
  },
  ENV_CMD: null
};

MobileSafari.$inject = ['baseBrowserDecorator', 'args'];

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['mocha', 'chai', 'snapshot', 'mocha-snapshot'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: './__snapshots__/*.md', included: false, watched: false },
      '../node_modules/marked/lib/marked.umd.js',
      { pattern: './*.spec.js', watched: false }
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      './__snapshots__/*.md': ['snapshot'],
      './*.spec.js': ['rollup']
    },
    rollupPreprocessor: {
      output: {
        name: 'lib',
        format: 'iife',
        sourcemap: 'inline',
        globals: {
          marked: 'marked',
          chai: 'chai',
          mocha: 'window'
        }
      },
      external: ['marked', 'chai', 'mocha'],
      plugins: [
        require('@rollup/plugin-commonjs')(),
        require('@rollup/plugin-node-resolve')(),
        require('@rollup/plugin-json')()
      ]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: Object.keys(customLaunchers),
    customLaunchers,
    browserNoActivityTimeout: 30000,
    // browsers: ['Chrome', 'Firefox', 'ChromeCanary', 'ChromeHeadless', 'Safari', 'PhantomJS', 'Opera', 'IE'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,
    plugins: [
      'karma-*',
      require('@chiragrupani/karma-chromium-edge-launcher'),
      require('./server.cjs')
    ]
  });
};
