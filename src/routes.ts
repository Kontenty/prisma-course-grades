import Hapi from '@hapi/hapi'

import { userController } from './controllers'
import * as vld from './validators'

const routes: Hapi.ServerRoute[] = [
  {
    method: 'GET',
    path: '/',
    handler: (_, h: Hapi.ResponseToolkit) => {
      return h.response({ up: true }).code(200)
    },
  },
  {
    method: 'POST',
    path: '/users',
    handler: userController.createUserHandler,
    options: {
      validate: {
        payload: vld.createUserValidator,
      },
    },
  },
  {
    method: 'PUT',
    path: '/user/{userId}',
    handler: userController.updateUserHandler,
    options: {
      validate: {
        payload: vld.updateUserValidator,
        params: vld.userIdValidator,
      },
    },
  },
  {
    method: 'GET',
    path: '/users',
    handler: userController.getUsersHandler,
  },
  {
    method: 'GET',
    path: '/user/{userId}',
    handler: userController.getUserHandler,
    options: {
      validate: {
        params: vld.userIdValidator,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/user/{userId}',
    handler: userController.deleteUserHandler,
    options: {
      validate: {
        params: vld.userIdValidator,
      },
    },
  },
]
export default routes
