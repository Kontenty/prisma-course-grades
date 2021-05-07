import Hapi from '@hapi/hapi'
import {
  isAdminOrSameUser,
  isAdminOrCourseTeacher,
  isAdminOrTestTeacher,
  isAdminOrGraderOfTestResult,
} from './helpers'

import * as controller from './controllers'
import * as vld from './validators'

const routes: Hapi.ServerRoute[] = [
  {
    method: 'GET',
    path: '/',
    handler: (_, h: Hapi.ResponseToolkit) => {
      return h.response({ up: true }).code(200)
    },
    options: { auth: false },
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
    method: 'POST',
    path: '/user',
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
    method: 'DELETE',
    path: '/user/{userId}',
    handler: controller.deleteUserHandler,
    options: {
      pre: [isAdminOrSameUser],
      validate: {
        params: vld.userIdValidator,
      },
      tags: ['api'],
    },
  },
  {
    method: 'GET',
    path: '/user/{userId}/courses',
    handler: controller.getUserEnrollmentHandler,
    options: {
      pre: [isAdminOrSameUser],
      validate: { params: vld.userIdValidator },
    },
  },
  {
    method: 'POST',
    path: '/user/{userId}/courses/{courseId}',
    handler: controller.createUserEnrollmentHandler,
    options: {
      pre: [isAdminOrSameUser],
      validate: { params: vld.userCourseValidator },
    },
  },
  {
    method: 'DELETE',
    path: '/user/{userId}/courses/{courseId}',
    handler: controller.deleteUserEnrollmentHandler,
    options: {
      pre: [isAdminOrSameUser],
      validate: { params: vld.userCourseValidator },
    },
  },
  {
    method: 'GET',
    path: '/courses',
    handler: controller.getCoursesHandler,
  },
  {
    method: 'GET',
    path: '/courses/{courseId}',
    handler: controller.getCourseHandler,
    options: {
      validate: { params: vld.courseIdValidator },
    },
  },
  {
    method: 'POST',
    path: '/courses',
    handler: controller.createCourseHandler,
    options: {
      validate: { payload: vld.createCourseValidator },
    },
  },
  {
    method: 'PUT',
    path: '/courses/{courseId}',
    handler: controller.updateCourseHandler,
    options: {
      pre: [isAdminOrCourseTeacher],
      validate: { payload: vld.updateCourseValidator },
    },
  },
  {
    method: 'DELETE',
    path: '/courses/{courseId}',
    handler: controller.deleteCourseHandler,
    options: {
      pre: [isAdminOrCourseTeacher],
      validate: { params: vld.courseIdValidator },
    },
  },
  {
    method: 'GET',
    path: '/courses/tests/{testId}',
    handler: controller.getTestHandler,
    options: {
      validate: { params: vld.testIdValidator },
    },
  },
  {
    method: 'POST',
    path: '/courses/{courseId}/tests',
    handler: controller.createTestHandler,
    options: {
      pre: [isAdminOrCourseTeacher],
      validate: { payload: vld.createTestValidator },
    },
  },
  {
    method: 'PUT',
    path: '/courses/tests/{testId}',
    handler: controller.updateTestHandler,
    options: {
      pre: [isAdminOrTestTeacher],
      validate: { payload: vld.updateTestValidator },
    },
  },
  {
    method: 'DELETE',
    path: '/courses/tests/{testId}',
    handler: controller.deleteTestHandler,
    options: {
      pre: [isAdminOrTestTeacher],
      validate: { params: vld.testIdValidator },
    },
  },
  // test results routes
  {
    method: 'GET',
    path: '/users/{userId}/test-results',
    handler: controller.getUserTestResultsHandler,
    options: {
      pre: [isAdminOrSameUser],
      validate: { params: vld.userIdValidator },
    },
  },
  {
    method: 'GET',
    path: '/courses/tests/{testId}/test-results',
    handler: controller.getTestResultsHandler,
    options: {
      pre: [isAdminOrTestTeacher],
      validate: { params: vld.testIdValidator },
    },
  },
  {
    method: 'POST',
    path: '/courses/tests/{testId}/test-results',
    handler: controller.createTestResultsHandler,
    options: {
      pre: [isAdminOrTestTeacher],
      validate: { params: vld.testIdValidator, payload: vld.createTestResultValidator },
    },
  },
  {
    method: 'PUT',
    path: '/courses/tests/test-results/{testResultId}',
    handler: controller.updateTestResultHandler,
    options: {
      pre: [isAdminOrGraderOfTestResult],
      validate: { params: vld.testResultIdValidator, payload: vld.updateTestResultValidator },
    },
  },
  {
    method: 'DELETE',
    path: '/courses/tests/test-results/{testResultId}',
    handler: controller.deleteTestResultHandler,
    options: {
      pre: [isAdminOrGraderOfTestResult],
      validate: { params: vld.testResultIdValidator },
    },
  },
  // login
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
