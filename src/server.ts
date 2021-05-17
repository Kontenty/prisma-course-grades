import Hapi from '@hapi/hapi'
import hapiAuthJWT from 'hapi-auth-jwt2'

import emailPlugin from './plugins/emailPlugin'
import prismaPlugin from './plugins/prismaPlugin'
import authPlugin from './plugins/authPlugin'
import swaggerPlugin from './plugins/swaggerPlugin'
import routes from './routes'

export async function createServer(): Promise<Hapi.Server> {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
  })
  await server.register([prismaPlugin, emailPlugin, hapiAuthJWT, authPlugin, swaggerPlugin])
  server.route(routes)
  await server.initialize()

  return server
}

export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start()
  console.log(`Server running on ${server.info.uri}`)
  return server
}
