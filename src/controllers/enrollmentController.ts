import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'

export const getUserEnrollmentHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const userId = parseInt(request.params.userId, 10)

  try {
    const userCourses = await prisma.course.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          where: { userId },
        },
      },
    })
    return h.response(userCourses).code(200)
  } catch (error) {
    console.log(error)
    return Boom.boomify(error, { statusCode: 500 })
  }
}

export const createUserEnrollmentHandler = async (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) => {
  const { prisma } = request.server.app
  const userId = parseInt(request.params.userId, 10)
  const courseId = parseInt(request.params.courseId, 10)

  try {
    const enrolled = await prisma.courseEnrollment.create({
      data: {
        user: {
          connect: { id: userId },
        },
        course: {
          connect: { id: courseId },
        },
        role: 'STUDENT',
      },
    })
    return h.response(enrolled).code(201)
  } catch (error) {
    console.log(error)
    return error?.code === 'P2025'
      ? Boom.notFound('user or course not found')
      : Boom.boomify(error, { statusCode: 500 })
  }
}
export const deleteUserEnrollmentHandler = async (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) => {
  const { prisma } = request.server.app
  const userId = parseInt(request.params.userId, 10)
  const courseId = parseInt(request.params.courseId, 10)

  try {
    await prisma.courseEnrollment.delete({
      where: { userId_courseId: { userId, courseId } },
    })
    return h.response().code(204)
  } catch (error) {
    console.dir(error)
    return error?.code === 'P2025'
      ? Boom.notFound('user or its course not found')
      : Boom.boomify(error, { statusCode: 500 })
  }
}
