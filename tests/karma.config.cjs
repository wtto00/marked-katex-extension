// Karma configuration
// Generated on Sun Aug 27 2023 21:47:29 GMT+0800 (中国标准时间)
const simctl = require("node-simctl");
const iosSimulator = require("appium-ios-simulator");

const log = require("karma/lib/logger").create("launcher:MobileSafari");

const launchers = {
  Safari_IOS_9: {
    base: "MobileSafari",
    name: "iPhone 5s",
    platform: "iOS",
    sdk: "9.0",
  },
  Safari_IOS_10: {
    base: "MobileSafari",
    name: "iPhone 5s",
    platform: "iOS",
    sdk: "10.0",
  },
  Safari_IOS_12: {
    base: "MobileSafari",
    name: "iPhone 5s",
    platform: "iOS",
    sdk: "12.4",
  },
  Safari_IOS_13: {
    base: "MobileSafari",
    name: "iPhone 8",
    platform: "iOS",
    sdk: "13.7",
  },
  Safari_IOS_14: {
    base: "MobileSafari",
    name: "iPhone 8",
    platform: "iOS",
    sdk: "14.4",
  },
  Safari_IOS_15_0: {
    base: "MobileSafari",
    name: "iPhone 13",
    platform: "iOS",
    sdk: "15.0",
  },
  Safari_IOS_15: {
    base: "MobileSafari",
    name: "iPhone 13",
    platform: "iOS",
    sdk: "15.2",
  },
  Safari_IOS_16_2: {
    base: "MobileSafari",
    name: "iPhone 14",
    platform: "iOS",
    sdk: "16.2",
  },
  Pixel_7_API_33_x86_64: {
    base: "AndroidEmulator",
    avdName: "Pixel_7_API_33_x86_64",
    sdkHome: "/home/runner/.android/sdk/",
  },
  Safari_Stable: {
    base: "SafariNative",
  },
  Chrome_Stable: {
    base: "ChromeHeadless",
  },
  Firefox_Stable: {
    base: "Firefox",
  },
  Edge_Stable: {
    base: "Edge",
  },
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
      // local_edge: {
      //   base: 'Edge'
      // }
      // local_ios_safari: {
      //   base: "MobileSafari",
      //   name: "iPhone 14",
      //   platform: "iOS",
      //   sdk: "16.0",
      // },
      local_android_browser: {
        base: "AndroidEmulator",
        avdName: "Pixel_7_API_33_x86_64",
        imageName: ''
      },
    };

const MobileSafari = function (baseBrowserDecorator, args) {
  if (process.platform !== "darwin") {
    log.error("This launcher only works in MacOS.");
    this._process.kill();
    return;
  }
  simctl.getDevices().then((res) => {
    console.log(res);
  });
  baseBrowserDecorator(this);
  this.on("start", (url) => {
    simctl
      .getDevices(args.sdk, args.platform)
      .then((devices) => {
        const d = devices.find((d) => {
          return d.name === args.name;
        });

        if (!d) {
          log.error(
            `No device found for sdk ${args.sdk} with name ${args.name}`
          );
          log.info("Available devices:", devices);
          this._process.kill();
          return;
        }

        return iosSimulator
          .getSimulator(d.udid)
          .then((device) => {
            return simctl.bootDevice(d.udid).then(() => device);
          })
          .then((device) => {
            return device.waitForBoot(60 * 5 * 1000).then(() => {
              return device.openUrl(url);
            });
          });
      })
      .catch((e) => {
        console.log("err,", e);
      });
  });
};

MobileSafari.prototype = {
  name: "MobileSafari",
  DEFAULT_CMD: {
    darwin:
      "/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/Contents/MacOS/Simulator",
  },
  ENV_CMD: null,
};

MobileSafari.$inject = ["baseBrowserDecorator", "args"];
var ip = require("ip");

var myip = ip.address();

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ["mocha", "chai", "snapshot", "mocha-snapshot"],

    // list of files / patterns to load in the browser
    files: [
      { pattern: "./__snapshots__/*.md", included: false, watched: false },
      "../node_modules/marked/lib/marked.umd.js",
      { pattern: "./*.spec.js", watched: false },
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      "./__snapshots__/*.md": ["snapshot"],
      "./*.spec.js": ["rollup"],
    },
    rollupPreprocessor: {
      output: {
        name: "lib",
        format: "iife",
        sourcemap: "inline",
        globals: {
          marked: "marked",
          chai: "chai",
          mocha: "window",
        },
      },
      external: ["marked", "chai", "mocha"],
      plugins: [
        require("@rollup/plugin-commonjs")(),
        require("@rollup/plugin-node-resolve")(),
        require("@rollup/plugin-json")(),
      ],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ["progress"],

    hostname: myip,
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
    captureTimeout: 300000, // 5 minutes
    browserDisconnectTimeout: 60000, // 1 minute
    browserNoActivityTimeout: 1200000, // 20 minutes
    browserDisconnectTolerance: 3,
    // browsers: ['Chrome', 'Firefox', 'ChromeCanary', 'ChromeHeadless', 'Safari', 'PhantomJS', 'Opera', 'IE'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: 5,
    plugins: [
      "karma-*",
      require("@chiragrupani/karma-chromium-edge-launcher"),
      require("./server.cjs"),
      {
        "launcher:MobileSafari": ["type", MobileSafari],
      },
      require("@wtto00/karma-android-emulator-launcher"),
    ],
  });
};
