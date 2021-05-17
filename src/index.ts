import { startServer, createServer } from './server'

;(async () => {
  try {
    const server = await createServer()
    await startServer(server)
  } catch (error) {
    console.log('Hapi start error', error)
  }
})()

process.on('unhandledRejection', (err) => {
  console.log('UnhandledRejection', err)
  process.exit(1)
})
