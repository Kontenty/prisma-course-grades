import Joi from 'joi'

const userInputValidator = Joi.object({
  first_name: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  last_name: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  email: Joi.string()
    .email()
    .alter({
      create: (schema) => schema.required(),
      update: (schema) => schema.optional(),
    }),
  isAdmin: Joi.boolean().optional(),
  social: Joi.object({
    facebook: Joi.string().optional(),
    twitter: Joi.string().optional(),
    github: Joi.string().optional(),
    website: Joi.string().optional(),
  }).optional(),
})

export const createUserValidator = userInputValidator.tailor('create')
export const updateUserValidator = userInputValidator.tailor('update')

const userId = Joi.number().integer()
const testId = Joi.number().integer()
const courseId = Joi.number().integer()
const testResultId = Joi.number().integer()
export const userIdValidator = Joi.object({ userId })
export const courseIdValidator = Joi.object({ courseId })
export const userCourseValidator = Joi.object({ userId, courseId })
export const testIdValidator = Joi.object({ testId })
export const testResultIdValidator = Joi.object({ testResultId })

const email = Joi.string().email().required()

export const loginValidator = Joi.object({ email })
export const authenticateValidator = Joi.object({ email, emailToken: Joi.string().required() })

const courseInputValidator = Joi.object({
  name: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  courseDetails: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
})

export const createCourseValidator = courseInputValidator.tailor('create')
export const updateCourseValidator = courseInputValidator.tailor('update')

const testInputValidator = Joi.object({
  name: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  date: Joi.date().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
})

export const createTestValidator = testInputValidator.tailor('create')
export const updateTestValidator = testInputValidator.tailor('update')

const testResultInputValidator = Joi.object({
  result: Joi.number().integer().sign('positive').max(1000).required(),
  studentId: Joi.number()
    .integer()
    .alter({
      create: (schema) => schema.required(),
      update: (schema) => schema.forbidden(),
    }),
  graderId: Joi.number()
    .integer()
    .alter({
      create: (schema) => schema.required(),
      update: (schema) => schema.forbidden(),
    }),
})

export const createTestResultValidator = testResultInputValidator.tailor('create')
export const updateTestResultValidator = testResultInputValidator.tailor('update')
