import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'

interface TestInput {
  name: string
  date: Date
}

export const getTestHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const testId = parseInt(request.params.testId, 10)

  try {
    const test = await prisma.test.findUnique({
      where: {
        id: testId,
      },
    })
    if (!test) {
      return h.response().code(404)
    } else {
      return h.response(test).code(200)
    }
  } catch (err) {
    request.log('error', err)
    return Boom.badImplementation('failed to get test')
  }
}

export const createTestHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const payload = request.payload as TestInput
  const courseId = parseInt(request.params.courseId, 10)

  try {
    const createdTest = await prisma.test.create({
      data: {
        name: payload.name,
        date: payload.date,
        course: {
          connect: {
            id: courseId,
          },
        },
      },
    })
    return h.response(createdTest).code(201)
  } catch (err) {
    request.log('error', err)
    return Boom.badImplementation('failed to create test')
  }
}

export const deleteTestHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const testId = parseInt(request.params.testId, 10)

  try {
    await prisma.test.delete({
      where: {
        id: testId,
      },
    })
    return h.response({ deleted: testId }).code(200)
  } catch (err) {
    request.log('error', err)
    return Boom.badImplementation('failed to delete test')
  }
}

export const updateTestHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const testId = parseInt(request.params.testId, 10)
  const payload = request.payload as Partial<TestInput>

  try {
    const updatedTest = await prisma.test.update({
      where: {
        id: testId,
      },
      data: payload,
    })
    return h.response(updatedTest).code(200)
  } catch (error) {
    request.log('error', error)
    return error?.code === 'P2025'
      ? Boom.notFound('test not found')
      : Boom.badImplementation('failed to update test')
  }
}
