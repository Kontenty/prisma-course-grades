import { createServer } from '../src/server'
import Hapi, { AuthCredentials } from '@hapi/hapi'
import { createUserCredentials } from './test-helpers'
import config from '../src/config'

interface User extends AuthCredentials {
  userId: number
  tokenId: number
  isAdmin: boolean
}

describe('users endpoint', () => {
  let server: Hapi.Server
  let testUserCredentials: User
  let testAdminCredentials: User
  let secondUserCredentials: User

  beforeAll(async () => {
    server = await createServer()
    testUserCredentials = await createUserCredentials(server.app.prisma, false)
    secondUserCredentials = await createUserCredentials(server.app.prisma, false)
    testAdminCredentials = await createUserCredentials(server.app.prisma, true)
  })

  afterAll(async () => {
    await server.stop()
  })

  let userId: number

  test('should create user', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/user',
      auth: {
        strategy: config.API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        first_name: 'test-first-name',
        last_name: 'test-last-name',
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
      url: '/users/999999',
      auth: {
        strategy: config.API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
    expect(res.statusCode).toEqual(404)
  })

  test('get user returns user', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/user/${userId}`,
      auth: {
        strategy: config.API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
    expect(response.statusCode).toEqual(200)
    const user = JSON.parse(response.payload)

    expect(user.id).toBe(userId)
  })

  test('get users returns array of users', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/users`,
      auth: {
        strategy: config.API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
    expect(response.statusCode).toEqual(200)
    const users = JSON.parse(response.payload)
    expect(Array.isArray(users)).toBeTruthy()
    expect(users[0].id).toBeTruthy()
  })

  test('delete user fails with invalid userId parameter', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/user/aa22`,
      auth: {
        strategy: config.API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
    expect(response.statusCode).toEqual(400)
  })

  test('delete user', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/user/${userId}`,
      auth: {
        strategy: config.API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
    expect(response.statusCode).toEqual(204)
  })

  test('user should update his data', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/user/${testUserCredentials.userId}`,
      auth: { strategy: config.API_AUTH_STATEGY, credentials: testUserCredentials },
      payload: {
        first_name: 'Lorem',
        last_name: 'Ipsum',
      },
    })
    expect(response.statusCode).toEqual(200)
    const user = JSON.parse(response.payload)
    expect(user.first_name).toEqual('Lorem')
    expect(user.last_name).toEqual('Ipsum')
  })

  test('user can not update other user data', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/user/${secondUserCredentials.userId}`,
      auth: { strategy: config.API_AUTH_STATEGY, credentials: testUserCredentials },
      payload: {
        first_name: 'Lorem',
        last_name: 'Ipsum',
      },
    })
    expect(response.statusCode).toEqual(403)
  })
})
