import Hapi from '@hapi/hapi'
import Joi from 'joi'
import Boom from '@hapi/boom'

interface UserInput {
  firstName: string
  lastName: string
  email: string
  social: {
    facebook?: string
    twitter?: string
    github?: string
    website?: string
  }
}

type Handler = (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) => Promise<Hapi.ResponseObject | undefined>

const userInputValidator = Joi.object({
  firstName: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  lastName: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  email: Joi.string()
    .email()
    .alter({
      create: (schema) => schema.required(),
      update: (schema) => schema.optional(),
    }),
  social: Joi.object({
    facebook: Joi.string().optional(),
    twitter: Joi.string().optional(),
    github: Joi.string().optional(),
    website: Joi.string().optional(),
  }).optional(),
})

const createUserValidator = userInputValidator.tailor('create')
const updateUserValidator = userInputValidator.tailor('update')

const createUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const payload = request.payload as UserInput

  try {
    const createdUser = await prisma.user.create({
      data: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        social: JSON.stringify(payload.social),
      },
      select: {
        id: true,
      },
    })
    return h.response(createdUser).code(201)
  } catch (error) {
    console.log(error)
    return h.response(error).code(500)
  }
}
const updateUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const payload = request.payload as UserInput
  const { userId } = request.params

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        social: JSON.stringify(payload.social),
      },
      select: {
        id: true,
      },
    })
    return h.response(user).code(200)
  } catch (error) {
    console.log(error)
    return h.response(error).code(500)
  }
}

const getUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const userId = parseInt(request.params.userId, 10)

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    return user ? h.response(user).code(200) : h.response().code(404)
  } catch (error) {
    console.log(error)
    return Boom.badImplementation()
  }
}

const deleteUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const userId = parseInt(request.params.userId, 10)

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    })
    return h.response('deleted').code(204)
  } catch (error) {
    console.log(error)
    return h.response().code(500)
  }
}

const usersPlugin: Hapi.Plugin<null> = {
  name: 'app/users',
  // dependencies: ['prisma'],
  register: async (server: Hapi.Server) => {
    server.route({
      method: 'POST',
      path: '/users',
      handler: createUserHandler,
      options: {
        validate: {
          payload: createUserValidator,
        },
      },
    })
    server.route({
      method: 'PUT',
      path: '/user/{userId}',
      handler: updateUserHandler,
      options: {
        validate: {
          payload: updateUserValidator,
          params: Joi.object({ userId: Joi.number().integer() }),
        },
      },
    })
    server.route({
      method: 'GET',
      path: '/users',
      handler: async (request) => {
        const { prisma } = request.server.app

        const users = prisma.user.findMany()
        return users
      },
    })
    server.route({
      method: 'GET',
      path: '/user/{userId}',
      handler: getUserHandler,
      options: {
        validate: {
          params: Joi.object({ userId: Joi.number().integer() }),
        },
      },
    })
    server.route({
      method: 'DELETE',
      path: '/user/{userId}',
      handler: deleteUserHandler,
      options: {
        validate: {
          params: Joi.object({ userId: Joi.number().integer() }),
        },
      },
    })
  },
}

export default usersPlugin
