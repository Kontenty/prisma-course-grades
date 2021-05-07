import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'

export const isAdminOrSameUser = (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { userId, isAdmin } = req.auth.credentials

  if (isAdmin) return h.continue

  const requestedUserId = parseInt(req.params.userId, 10)

  if (requestedUserId === userId) return h.continue

  throw Boom.forbidden()
}

type Credentials = {
  isAdmin: boolean
  teacherOf?: number[]
}

export const isAdminOrCourseTeacher = (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { isAdmin, teacherOf } = req.auth.credentials as Credentials
  if (isAdmin) return h.continue

  const courseId = parseInt(req.params.courseId, 10)

  if (teacherOf && teacherOf?.includes(courseId)) return h.continue

  throw Boom.forbidden()
}

// Pre function to check if user is the teacher of a test's course
export const isAdminOrTestTeacher = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { isAdmin, teacherOf } = request.auth.credentials as Credentials

  if (isAdmin) return h.continue

  const testId = parseInt(request.params.testId, 10)
  const { prisma } = request.server.app

  try {
    const test = await prisma.test.findUnique({
      where: {
        id: testId,
      },
      select: {
        course: {
          select: {
            id: true,
          },
        },
      },
    })

    if (test?.course.id && teacherOf && teacherOf.includes(test?.course.id)) {
      return h.continue
    }
  } catch (err) {
    console.log(err)
  }

  // The authenticated user is not a teacher
  throw Boom.forbidden()
}

// Pre function to check if authenticated user is the grader of a testResult
export const isAdminOrGraderOfTestResult = async (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) => {
  const { userId, isAdmin, teacherOf } = request.auth.credentials

  if (isAdmin) return h.continue

  const testResultId = parseInt(request.params.testResultId, 10)
  const { prisma } = request.server.app

  const testResult = await prisma.testResult.findUnique({
    where: {
      id: testResultId,
    },
  })

  if (testResult?.graderId === userId) {
    return h.continue
  }
  // The authenticated user is not a teacher
  throw Boom.forbidden()
}
