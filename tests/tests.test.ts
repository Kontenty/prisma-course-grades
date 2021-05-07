import { createServer } from '../src/server'
import Hapi, { AuthCredentials } from '@hapi/hapi'
import { add } from 'date-fns'
import { createCourse, createUserCredentials } from './test-helpers'
import config from '../src/config'

const { API_AUTH_STATEGY } = config

interface User extends AuthCredentials {
  userId: number
  tokenId: number
  isAdmin: boolean
}

describe('tests endpoints', () => {
  let server: Hapi.Server
  let testTeacherCredentials: User
  let testAdminCredentials: User
  const weekFromNow = add(new Date(), { days: 7 })
  let testId: number
  let courseId: number

  beforeAll(async () => {
    server = await createServer()
    // Create a test user and admin and get the credentials object for them
    testTeacherCredentials = await createUserCredentials(server.app.prisma, false)
    testAdminCredentials = await createUserCredentials(server.app.prisma, true)
    courseId = await createCourse(server.app.prisma)
    testTeacherCredentials.teacherOf = [courseId]
  })

  afterAll(async () => {
    await server.stop()
  })

  test('create test', async () => {
    const testResponse = await server.inject({
      method: 'POST',
      url: `/courses/${courseId}/tests`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testTeacherCredentials,
      },
      payload: {
        name: 'First Test',
        date: weekFromNow.toString(),
      },
    })

    expect(testResponse.statusCode).toEqual(201)

    testId = JSON.parse(testResponse.payload)?.id
    expect(typeof testId === 'number').toBeTruthy()
  })

  test('create test validation', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/courses',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testTeacherCredentials,
      },
      payload: {
        name: 'name',
        invalidField: 'woot',
      },
    })

    expect(response.statusCode).toEqual(400)
  })

  test('get course returns 404 for non existant course', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/courses/tests/9999',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testTeacherCredentials,
      },
    })

    expect(response.statusCode).toEqual(404)
  })

  test('get test should return test', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/courses/tests/${testId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testTeacherCredentials,
      },
    })
    expect(response.statusCode).toEqual(200)
    const course = JSON.parse(response.payload)

    expect(course.id).toBe(testId)
  })

  test('get course fails with invalid id', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/courses/tests/a123',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testTeacherCredentials,
      },
    })
    expect(response.statusCode).toEqual(400)
  })

  test('update course fails with invalid testId parameter', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/courses/tests/aa22`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testTeacherCredentials,
      },
    })
    expect(response.statusCode).toEqual(400)
  })

  test('should update course test', async () => {
    const updatedName = `test-UPDATED-NAME-${new Date().toISOString()}`

    const response = await server.inject({
      method: 'PUT',
      url: `/courses/tests/${testId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testTeacherCredentials,
      },
      payload: {
        name: updatedName,
      },
    })
    expect(response.statusCode).toEqual(200)
    const course = JSON.parse(response.payload)
    expect(course.name).toEqual(updatedName)
  })

  test('delete course fails with invalid testId parameter', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/courses/tests/aa22`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testTeacherCredentials,
      },
    })
    expect(response.statusCode).toEqual(400)
  })

  test('should delete course test', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/courses/tests/${testId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testTeacherCredentials,
      },
    })
    expect(response.statusCode).toEqual(200)
  })
})
