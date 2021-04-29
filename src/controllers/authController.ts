import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import { nanoid } from 'nanoid'
import { add } from 'date-fns'
import { TokenType } from '.prisma/client'

interface LoginInput {
  email: string
}
const EMAIL_TOKEN_EXPIRATION_MINUTES = 10

export const loginHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma, sendEmailToken } = request.server.app
  const { email } = request.payload as LoginInput
  const emailToken = nanoid()
  const tokenExpiration = add(new Date(), { minutes: EMAIL_TOKEN_EXPIRATION_MINUTES })

  try {
    const createdToken = await prisma.token.create({
      data: {
        emailToken,
        type: TokenType.EMAIL,
        expiration: tokenExpiration,
        user: {
          connectOrCreate: {
            create: { email },
            where: { email },
          },
        },
      },
    })

    await sendEmailToken(email, emailToken)

    return h.response(createdToken).code(200)
  } catch (error) {
    console.log(error)
    return Boom.badImplementation(error.message)
  }
}
