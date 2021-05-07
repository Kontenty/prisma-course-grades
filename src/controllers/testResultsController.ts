import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'

interface TestResultInput {
  result: number
  studentId: number
  graderId: number
}

export const getTestResultsHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const testId = parseInt(request.params.testId, 10)

  try {
    const testResults = await prisma.testResult.findMany({
      where: {
        testId: testId,
      },
    })

    return h.response(testResults).code(200)
  } catch (err) {
    request.log('error', err)
    return Boom.badImplementation(`failed to get test results for test ${testId}`)
  }
}

export const getUserTestResultsHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const userId = parseInt(request.params.userId, 10)

  try {
    const userTestResults = await prisma.testResult.findMany({
      where: {
        studentId: userId,
      },
    })
    return h.response(userTestResults).code(200)
  } catch (err) {
    request.log('error', err)
    console.log(err)
    return Boom.badImplementation('failed to get user test results')
  }
}

export const createTestResultsHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const payload = request.payload as TestResultInput
  const testId = parseInt(request.params.testId, 10)

  try {
    const createdTestResult = await prisma.testResult.create({
      data: {
        result: payload.result,
        student: {
          connect: { id: payload.studentId },
        },
        gradedBy: {
          connect: { id: payload.graderId },
        },
        test: {
          connect: {
            id: testId,
          },
        },
      },
    })
    return h.response(createdTestResult).code(201)
  } catch (error) {
    console.log(error)
    return error?.code === 'P2025'
      ? Boom.notFound('student, grader or test not found')
      : Boom.badImplementation(`failed to create test result for testId: ${testId}`)
  }
}

export const updateTestResultHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const testResultId = parseInt(request.params.testResultId, 10)
  const payload = request.payload as Pick<TestResultInput, 'result'>

  try {
    // Only allow updating the result
    const updatedTestResult = await prisma.testResult.update({
      where: {
        id: testResultId,
      },
      data: {
        result: payload.result,
      },
    })
    return h.response(updatedTestResult).code(200)
  } catch (error) {
    console.log(error)
    return error?.code === 'P2025'
      ? Boom.notFound('test result not found')
      : Boom.badImplementation('failed to update test result')
  }
}

export const deleteTestResultHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const testResultId = parseInt(request.params.testResultId, 10)

  try {
    await prisma.testResult.delete({
      where: {
        id: testResultId,
      },
    })
    return h.response().code(204)
  } catch (err) {
    request.log('error', err)
    return Boom.badImplementation('failed to delete test result')
  }
}
