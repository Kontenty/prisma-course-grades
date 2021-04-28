const path = require('path')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: path.join(__dirname, 'prisma', 'prisma-test-env.js'),
  verbose: true,
  testTimeout: 10000,
}
