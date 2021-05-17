import Hapi from '@hapi/hapi'
import hapiAuthJWT from 'hapi-auth-jwt2'

import emailPlugin from './plugins/emailPlugin'
import prismaPlugin from './plugins/prismaPlugin'
import authPlugin from './plugins/authPlugin'
import swaggerPlugin from './plugins/swaggerPlugin'
import routes from './routes'
import { HOST, PORT } from './config'

export async function start(): Promise<Hapi.Server> {
  const server = Hapi.server({
    port: PORT,
    host: HOST,
  })
  await server.register([prismaPlugin, emailPlugin, hapiAuthJWT, authPlugin, swaggerPlugin])
  server.route(routes)
  // await server.initialize()
  await server.start()
  console.log(`Server running on ${server.info.uri}`)
  return server
}
