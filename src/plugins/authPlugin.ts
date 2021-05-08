import { UserRole } from '@prisma/client'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import config from '../config'

const apiTokenSchema = Joi.object({
  tokenId: Joi.number().integer().required(),
})

const validateAPIToken = async (
  decoded: { tokenId: number },
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) => {
  const { prisma } = request.server.app
  const { tokenId } = decoded
  const { error } = apiTokenSchema.validate(decoded)

  if (error) {
    request.log(['error', 'auth'], `API token error ${error?.message}`)
    return { isValid: false }
  }

  try {
    const fetchedToken = await prisma.token.findUnique({
      where: { id: tokenId },
      include: { user: true },
    })

    if (!fetchedToken || !fetchedToken?.valid)
      return { isValid: false, errorMessage: 'Token expired' }

    // Get all the courses that the user is the teacher of
    const teacherOf = await prisma.courseEnrollment.findMany({
      where: { userId: fetchedToken.userId, role: UserRole.TEACHER },
      select: { courseId: true },
    })

    return {
      isValid: true,
      credentials: {
        tokenId,
        userId: fetchedToken.userId,
        isAdmin: fetchedToken.user.isAdmin,
        teacherOf: teacherOf.map(({ courseId }) => courseId),
      },
    }
  } catch (error) {
    request.log(['error', 'auth', 'db'], error)
    return { valid: false }
  }
}

const authPlugin: Hapi.Plugin<null> = {
  name: 'app/auth',
  register: async (server: Hapi.Server) => {
    server.auth.strategy(config.API_AUTH_STATEGY, 'jwt', {
      key: config.JWT_SECRET,
      verifyOptions: { algorithms: [config.JWT_ALGO] },
      validate: validateAPIToken,
    })
    server.auth.default(config.API_AUTH_STATEGY)
  },
}

export default authPlugin
