import { devices } from 'playwright';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  restoreMocks: true,
  clearMocks: true,
  // collectCoverage: true,
  collectCoverageFrom: [
    'src/index.js'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  testRegex: /browser\.test\.js$/.source,
  transform: {
    '\\.[jt]sx?$': 'babel-jest'
  },
  preset: 'jest-playwright-preset',
  testEnvironmentOptions: {
    'jest-playwright': {
      browsers: ['webkit'],
      // browsers: ['chromium', 'firefox', 'webkit'],
      devices: [
        devices['iPhone 7']
        // devices['Pixel 4'],
        // devices['Desktop Chrome'],
        // devices['Desktop Safari'],
        // devices['Desktop Edge'],
        // devices['Desktop Firefox']
      ]
    }
  }
};
