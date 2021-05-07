import { PrismaClient, TokenType, UserRole } from '@prisma/client'
import { nanoid } from 'nanoid'
import { add } from 'date-fns'
import { AuthCredentials } from '@hapi/hapi'

interface User extends AuthCredentials {
  userId: number
  tokenId: number
  isAdmin: boolean
  teacherOf?: number[]
}

export const createUserCredentials = async (prisma: PrismaClient, isAdmin: boolean) => {
  const testUser = await prisma.user.create({
    data: {
      email: `test-${nanoid()}@test.com`,
      isAdmin,
      tokens: {
        create: { expiration: add(new Date(), { days: 7 }), type: TokenType.API },
      },
    },
    include: {
      tokens: true,
    },
  })

  return {
    userId: testUser.id,
    tokenId: testUser.tokens[0].id,
    isAdmin: testUser.isAdmin,
  }
}

export const createCourse = async (prisma: PrismaClient): Promise<number> => {
  const course = await prisma.course.create({
    data: {
      name: `test-course-${Date.now().toString()}`,
      courseDetails: `test-course-${Date.now().toString()}-details`,
    },
  })
  return course.id
}

// Helper function to create a course, test, student, and a teacher
export const createCourseTestStudentTeacher = async (prisma: PrismaClient) => {
  const teacherCredentials: User = await createUserCredentials(prisma, false)
  const studentCredentials = await createUserCredentials(prisma, false)

  const now = Date.now().toString()
  const course = await prisma.course.create({
    data: {
      name: `test-course-${now}`,
      courseDetails: `test-course-${now}-details`,
      members: {
        create: [
          {
            role: UserRole.TEACHER,
            user: {
              connect: {
                id: teacherCredentials.userId,
              },
            },
          },
          {
            role: UserRole.STUDENT,
            user: {
              connect: {
                id: studentCredentials.userId,
              },
            },
          },
        ],
      },
      tests: {
        create: [
          {
            date: add(new Date(), { days: 7 }),
            name: 'First test',
          },
        ],
      },
    },
    include: {
      tests: true,
    },
  })

  // 👇Update the credentials as they're static in tests (not fetched automatically on request by the auth plugin)
  teacherCredentials.teacherOf = [course.id]

  return {
    courseId: course.id,
    testId: course.tests[0].id,
    teacherId: teacherCredentials.userId,
    teacherCredentials,
    studentId: studentCredentials.userId,
    studentCredentials,
  }
}
