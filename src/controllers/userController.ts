import Hapi from '@hapi/hapi'
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

export const getUsersHandler = (request: Hapi.Request) => {
  const { prisma } = request.server.app

  try {
    const users = prisma.user.findMany()
    return users
  } catch (error) {
    console.log(error)
    return Boom.boomify(error, { statusCode: 500 })
  }
}

export const createUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
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
export const updateUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
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
    })
    return h.response(user).code(200)
  } catch (error) {
    console.log(error)
    return h.response(error).code(500)
  }
}

export const getUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
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

export const deleteUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const userId = parseInt(request.params.userId, 10)

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (!user) return h.response('user not found').code(404)

    await prisma.$transaction([
      prisma.token.deleteMany({
        where: { userId },
      }),
      prisma.user.delete({
        where: {
          id: userId,
        },
      }),
    ])

    return h.response('deleted').code(204)
  } catch (error) {
    console.log(error)
    return h.response().code(500)
  }
}
