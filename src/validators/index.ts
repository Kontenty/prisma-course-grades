import Joi from 'joi'

const userInputValidator = Joi.object({
  firstName: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  lastName: Joi.string().alter({
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

export const userIdValidator = Joi.object({ userId: Joi.number().integer() })

const email = Joi.string().email().required()

export const loginValidator = Joi.object({ email })
export const authenticateValidator = Joi.object({ email, emailToken: Joi.string().required() })
