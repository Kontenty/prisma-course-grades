import Hapi from '@hapi/hapi'

import emailPlugin from './plugins/emailPlugin'
import prismaPlugin from './plugins/prismaPlugin'
import routes from './routes'

const server = Hapi.server({
  port: process.env.PORT || 5000,
  host: process.env.HOST || 'localhost',
})

export async function createServer(): Promise<Hapi.Server> {
  await server.register([prismaPlugin, emailPlugin])
  routes.forEach((route) => {
    server.route(route)
  })
  await server.initialize()

  return server
}

export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start()
  console.log(`Server running on ${server.info.uri}`)
  return server
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})
