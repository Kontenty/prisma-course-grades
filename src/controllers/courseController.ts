import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'

export const getCourseHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const courseId = parseInt(request.params.courseId, 10)

  try {
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        tests: true,
      },
    })
    if (!course) {
      return h.response('course not found').code(404)
    } else {
      return h.response(course).code(200)
    }
  } catch (err) {
    request.log('error', err)
    return Boom.badImplementation('failed to get course')
  }
}

export const getCoursesHandler = async (request: Hapi.Request) => {
  const { prisma } = request.server.app

  try {
    const courses = prisma.course.findMany()
    return courses
  } catch (error) {
    console.log(error)
    return Boom.boomify(error, { statusCode: 500 })
  }
}

interface CourseInput {
  name: string
  courseDetails: string
}

export const createCoursesHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const { name, courseDetails } = request.payload as CourseInput
  const { userId } = request.auth.credentials

  if (typeof userId === 'number') {
    try {
      const newCourse = prisma.course.create({
        data: {
          name,
          courseDetails,
          members: {
            create: {
              role: 'TEACHER',
              user: { connect: { id: userId } },
            },
          },
        },
      })
      return h.response(newCourse).code(201)
    } catch (error) {
      console.log(error)
      return Boom.boomify(error, { statusCode: 500 })
    }
  } else {
    return Boom.badRequest('user id has to be number')
  }
}
export const updateCoursesHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const payload = request.payload as Partial<CourseInput>
  const courseId = parseInt(request.params.courseId, 10)

  if (typeof courseId === 'number') {
    try {
      const course = prisma.course.update({
        where: { id: courseId },
        data: payload,
      })
      return h.response(course).code(201)
    } catch (error) {
      console.log(error)
      return Boom.boomify(error, { statusCode: 500 })
    }
  } else {
    return Boom.badRequest('course id has to be number')
  }
}
