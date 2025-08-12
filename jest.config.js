process.setMaxListeners(30);

module.exports = {
  'preset': 'jest-puppeteer',
  'testMatch': [
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  'testTimeout': 60000,
  'maxWorkers': 1, // Run tests sequentially to avoid browser conflicts
  'setupFilesAfterEnv': ['<rootDir>/__tests__/helpers/jestPuppeteerServerSetup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  // Better cleanup and error handling
  'forceExit': true,
  'detectOpenHandles': true,
  'workerIdleMemoryLimit': '1GB',
};
