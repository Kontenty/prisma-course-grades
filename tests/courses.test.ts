import { createServer } from '../src/server'
import Hapi, { AuthCredentials } from '@hapi/hapi'
import { createUserCredentials } from './test-helpers'
import { config } from '../src/config'

describe('courses endpoint', () => {
  let server: Hapi.Server
  let testUserCredentials: AuthCredentials
  let testAdminCredentials: AuthCredentials
  let courseId: number
  beforeAll(async () => {
    server = await createServer()
    testUserCredentials = await createUserCredentials(server.app.prisma, false)
    testAdminCredentials = await createUserCredentials(server.app.prisma, true)
  })

  afterAll(() => {
    server.stop()
  })

  test('should create course', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/courses',
      auth: { strategy: config.API_AUTH_STATEGY, credentials: testAdminCredentials },
      payload: {
        name: 'Python',
        courseDetails: 'Python for newbies',
      },
    })

    expect(res.statusCode).toEqual(201)
    courseId = JSON.parse(res.payload)?.id
    expect(courseId).toBeTruthy()
  })
  test('should update course', async () => {
    const res = await server.inject({
      method: 'PUT',
      url: `/courses/${courseId}`,
      auth: { strategy: config.API_AUTH_STATEGY, credentials: testAdminCredentials },
      payload: {
        name: 'Python entry',
      },
    })

    expect(res.statusCode).toEqual(200)
    expect(JSON.parse(res.payload)?.name).toEqual('Python entry')
  })
})
