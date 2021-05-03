import Hapi from '@hapi/hapi'
import { isAdminOrSameUser } from './helpers'

import * as controller from './controllers'
import * as vld from './validators'

const routes: Hapi.ServerRoute[] = [
  {
    method: 'GET',
    path: '/',
    handler: (_, h: Hapi.ResponseToolkit) => {
      return h.response({ up: true }).code(200)
    },
    options: {auth: false}
  },
  {
    method: 'POST',
    path: '/users',
    handler: controller.createUserHandler,
    options: {
      validate: {
        payload: vld.createUserValidator,
      },
      tags: ['api'],
    },
  },
  {
    method: 'PUT',
    path: '/user/{userId}',
    handler: controller.updateUserHandler,
    options: {
      pre: [isAdminOrSameUser],
      validate: {
        payload: vld.updateUserValidator,
        params: vld.userIdValidator,
      },
      tags: ['api'],
    },
  },
  {
    method: 'GET',
    path: '/users',
    handler: controller.getUsersHandler,
    options: {
      tags: ['api'],
    },
  },
  {
    method: 'GET',
    path: '/user/{userId}',
    handler: controller.getUserHandler,
    options: {
      pre: [isAdminOrSameUser],
      validate: {
        params: vld.userIdValidator,
      },
      tags: ['api'],
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
      tags: ['api'],
    },
  },
  {
    method: 'POST',
    path: '/login',
    handler: controller.loginHandler,
    options: {
      auth: false,
      validate: { payload: vld.loginValidator },
    },
  },
  {
    method: 'POST',
    path: '/authenticate',
    handler: controller.authenticateHandler,
    options: {
      auth: false,
      validate: { payload: vld.authenticateValidator },
    },
  },
]
export default routes
