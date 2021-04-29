import Hapi from '@hapi/hapi'

import * as controller from './controllers'
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
    handler: controller.createUserHandler,
    options: {
      validate: {
        payload: vld.createUserValidator,
      },
    },
  },
  {
    method: 'PUT',
    path: '/user/{userId}',
    handler: controller.updateUserHandler,
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
    handler: controller.getUsersHandler,
  },
  {
    method: 'GET',
    path: '/user/{userId}',
    handler: controller.getUserHandler,
    options: {
      validate: {
        params: vld.userIdValidator,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/user/{userId}',
    handler: controller.deleteUserHandler,
    options: {
      validate: {
        params: vld.userIdValidator,
      },
    },
  },
  {
    method: 'POST',
    path: '/login',
    handler: controller.loginHandler,
    options: {
      auth: false,
      validate: { payload: vld.emailValidator },
    },
  },
]
export default routes
