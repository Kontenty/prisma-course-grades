import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'

export const getUserEnrollmentHandler = async (request: Hapi.Request) => {
  const { prisma } = request.server.app
  const userId = parseInt(request.params.userId, 10)

  try {
    const users = prisma.courseEnrollment.findMany({
      where: { userId },
      include: { course: true },
    })
    return users
  } catch (error) {
    console.log(error)
    return Boom.boomify(error, { statusCode: 500 })
  }
}

interface CreateEnrollmentPayload {
  courseId: number
}
export const createUserEnrollmentHandler = async (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) => {
  const { prisma } = request.server.app
  const userId = parseInt(request.params.userId, 10)
  const { courseId } = request.payload as CreateEnrollmentPayload

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
    return Boom.boomify(error, { statusCode: 500 })
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
    return h.response(`removed enrollment`).code(204)
  } catch (error) {
    console.log(error)
    return Boom.boomify(error, { statusCode: 500 })
  }
}
