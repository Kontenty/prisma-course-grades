import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'

export const isAdminOrSameUser = (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { userId, isAdmin } = req.auth.credentials

  if (isAdmin) return h.continue

  const requestedUserId = parseInt(req.params.userId, 10)

  if (requestedUserId === userId) return h.continue

  throw Boom.forbidden()
}
