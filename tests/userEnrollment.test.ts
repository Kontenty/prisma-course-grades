import { createServer } from '../src/server'
import Hapi, { AuthCredentials } from '@hapi/hapi'
import { createUserCredentials, createCourse } from './test-helpers'
import config from '../src/config'

const { API_AUTH_STATEGY } = config

interface User extends AuthCredentials {
  userId: number
  tokenId: number
  isAdmin: boolean
}

describe('user enrollment endpoint', () => {
  let server: Hapi.Server
  let testUserCredentials: User
  let testTeacherCredentials: User
  let courseId: number
  let studentId: number
  let teacherId: number

  beforeAll(async () => {
    server = await createServer()
    testUserCredentials = await createUserCredentials(server.app.prisma, false)
    testTeacherCredentials = await createUserCredentials(server.app.prisma, false)
    courseId = await createCourse(server.app.prisma)
    studentId = testUserCredentials.userId
    teacherId = testTeacherCredentials.userId
  })

  afterAll(async () => {
    await server.stop()
  })

  test('user can enroll to course', async () => {
    const response = await server.inject({
      method: 'POST',
      url: `/users/${studentId}/courses/${courseId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testUserCredentials,
      },
      payload: {
        courseId,
        role: 'STUDENT',
      },
    })
    expect(response.statusCode).toEqual(201)
    const userCourse = JSON.parse(response.payload)
    expect(userCourse.role).toEqual('STUDENT')
    expect(userCourse.userId).toEqual(studentId)
    expect(userCourse.courseId).toEqual(courseId)
  })

  test('get user courses', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/users/${studentId}/courses`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testUserCredentials,
      },
    })
    expect(response.statusCode).toEqual(200)
    const userCourses = JSON.parse(response.payload)
    expect(userCourses[0]?.id).toEqual(courseId)
  })

  test('delete user enrollment in course', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/users/${studentId}/courses/${courseId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testUserCredentials,
      },
    })
    expect(response.statusCode).toEqual(204)
  })

  test('get user courses is empty after deletion', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/users/${studentId}/courses`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testUserCredentials,
      },
    })
    expect(response.statusCode).toEqual(200)
    const userCourses = JSON.parse(response.payload)
    expect(userCourses.length).toEqual(0)
  })
})
