import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { add } from 'date-fns'
import { config } from 'dotenv'
import { TokenType } from '.prisma/client'
config()

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'rtzPU5Ft+CX1VO0JHqizz7ZL9ABeLWwsqaAxOd8UjJrgefoI3/B1FfzsVTPw/mqGqHd9JnTNZwxnOouoO443BMjKOIoUivQzKdfVnQ4CS5pCJHeW7d9MJIqXCYS+lCcpLFZQ5s6NvXpQ22pFhAx8gzlS7eQb0kg1oF/bTVa0E3YemWuhgRUz3IEHsRPo+1UyIlfuLiurt7OJzXh+vitxHByvJZWAjPOdym8lSSUP64UdMQaD0ultpGzgR6u/qcJzKWu/6fvBScMeSk6Fo8wcR3JKuR56ctPw42RVWkA9mZjBZdka0zaT386APL0p3v6BwJszZr6+hdWAL/YtJ4btAg=='
const JWT_ALGO = 'HS256'

interface LoginInput {
  email: string
}

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10
const AUTHENTICATION_TOKEN_EXPIRATION_HOURS = 12

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
    return Boom.badImplementation(error?.message)
  }
}

const generateJwtToken = (tokenId: number) =>
  jwt.sign({ tokenId }, JWT_SECRET, {
    algorithm: JWT_ALGO,
    noTimestamp: true,
  })

interface AuthenticateInput {
  email: string
  emailToken: string
}

export const authenticateHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { prisma } = request.server.app
  const { email, emailToken } = request.payload as AuthenticateInput

  try {
    const fetchedEmailToken = await prisma.token.findUnique({
      where: { emailToken },
      include: { user: true },
    })

    if (!fetchedEmailToken?.valid) {
      return Boom.unauthorized()
    }
    if (fetchedEmailToken.expiration < new Date()) {
      return Boom.unauthorized('Token expired')
    }
    if (fetchedEmailToken?.user?.email === email) {
      const tokenExpiration = add(new Date(), { hours: AUTHENTICATION_TOKEN_EXPIRATION_HOURS })

      const createdApiToken = await prisma.token.create({
        data: {
          type: TokenType.API,
          expiration: tokenExpiration,
          user: { connect: { email } },
        },
      })

      await prisma.token.update({
        where: { id: fetchedEmailToken.id },
        data: { valid: false },
      })

      const authToken = generateJwtToken(createdApiToken.id)

      return h.response().code(200).header('Authorization', authToken)
    } else {
      return Boom.unauthorized()
    }
  } catch (error) {
    return Boom.badImplementation(error?.message)
  }
}
