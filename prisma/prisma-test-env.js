const path = require('path')
const util = require('util')
const NodeEnvironment = require('jest-environment-node')
const exec = util.promisify(require('child_process').exec)
const { PrismaClient } = require('@prisma/client')

const PrismaBinary = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma')

class PrismaTestEnviroment extends NodeEnvironment {
  constructor(config) {
    super(config)

    this.schema = 'test_' + Math.random().toString(36).substr(2, 9)
    this.dbName = `grading_test`
    this.dbUrl = `postgresql://root:root@localhost:5432/${this.dbName}?schema=${this.schema}`
    process.env.DATABASE_URL = this.dbUrl
    this.global.process.env.DATABASE_URL = this.dbUrl
    this.client = new PrismaClient()
  }

  async setup() {
    try {
      await this.client.$executeRaw(`create schema if not exists "${this.schema}"`)
      await exec(`${PrismaBinary} db push --preview-feature`)
      // await exec('npm run seed')
      return super.setup()
    } catch (error) {
      console.error('🛑 setup error')
      console.dir(error)
    }
  }

  async teardown() {
    try {
      await this.client.$executeRaw(`drop schema if exists "${this.schema}" cascade`)
      await this.client.$disconnect()
      await super.teardown()
    } catch (error) {
      console.error('🛑 teardown error')
      console.dir(error)
    }
  }
}

module.exports = PrismaTestEnviroment
