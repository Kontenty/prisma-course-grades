import Hapi from '@hapi/hapi'

declare module '@hapi/hapi' {
  interface ServerApplicationState {
    sendEmailToken(email: string, token: string): Promise<void>
  }
}

const swaggerPlugin = {
  name: 'app/swagger',
  register: async (server: Hapi.Server) => {
    try {
      return server.register([
        require('@hapi/inert'),
        require('@hapi/vision'),
        {
          plugin: require('hapi-swagger'),
          options: {
            info: {
              title: 'Grading app API documentation',
            },
            securityDefinitions: {
              jwt: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
              },
            },
            security: [{ jwt: [] }],
          },
        },
      ])
    } catch (error) {
      console.log(`Error registering swagger plugin: ${error}`)
    }
  },
}

export default swaggerPlugin
