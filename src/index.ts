import { start } from './server'

process.on('unhandledRejection', (err) => {
  console.log('UnhandledRejection', err)
  process.exit(1)
})

start().catch((err) => {
  console.log('Hapi start error', err)
})
