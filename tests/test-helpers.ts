import { PrismaClient, TokenType, UserRole } from '@prisma/client'
import { nanoid } from 'nanoid'
import { add } from 'date-fns'
import { AuthCredentials } from '@hapi/hapi'

import config from '../src/config'

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
