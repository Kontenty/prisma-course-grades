import { createServer } from '../src/server'
import Hapi from '@hapi/hapi'

describe('POST /users - create user', () => {
  let server: Hapi.Server

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  let userId: number = 5

  test('should create user', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        firstName: 'test-first-name',
        lastName: 'test-last-name',
        email: `test-${Date.now()}@prisma.io`,
        social: {
          twitter: 'thisisalice',
          website: 'https://www.thisisalice.com',
        },
      },
    })
    expect(response.statusCode).toEqual(201)
    userId = JSON.parse(response.payload)?.id
    expect(typeof userId === 'number').toBeTruthy()
  })

  test('should return 404 for nonexistent user', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/users/9999',
    })
    expect(res.statusCode).toEqual(404)
  })

  test('get user returns user', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/user/${userId}`,
    })
    expect(response.statusCode).toEqual(200)
    const user = JSON.parse(response.payload)

    expect(user.id).toBe(userId)
  })

  test('delete user fails with invalid userId parameter', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/user/aa22`,
    })
    expect(response.statusCode).toEqual(400)
  })

  test('delete user', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/user/${userId}`,
    })
    expect(response.statusCode).toEqual(204)
  })
})
