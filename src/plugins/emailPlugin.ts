import Hapi from '@hapi/hapi'
import Joi from 'joi'
import Boom from '@hapi/boom'
import sendgrid from '@sendgrid/mail'
import { config } from 'dotenv'
config()

const { SENDGRID_API_KEY, SENDGRID_EMAIL } = process.env

declare module '@hapi/hapi' {
  interface ServerApplicationState {
    sendEmailToken(email: string, token: string): Promise<void>
  }
}

const sendEmailToken = async (email: string, token: string) => {
  const msg = {
    to: email,
    from: SENDGRID_EMAIL || 'test@test.com',
    subject: 'Login token for the modern backend API',
    text: `The login token for the API is: ${token}`,
  }
  try {
    await sendgrid.send(msg)
    console.log('Email sent')
  } catch (error) {
    console.log('🛑 Send email error', error)
  }
}

const debugSendEmailToken = async (email: string, token: string) => {
  console.log(`email token for ${email} : ${token}`)
}

const emailPlugin = {
  name: 'app/email',
  register: async (server: Hapi.Server) => {
    if (!SENDGRID_API_KEY) {
      console.log(
        `The SENDGRID_API_KEY env var must be set, otherwise the API won't be able to send emails.`,
        `Using debug mode which logs the email tokens instead.`,
      )
      server.app.sendEmailToken = debugSendEmailToken
    } else {
      sendgrid.setApiKey(SENDGRID_API_KEY)
      server.app.sendEmailToken = sendEmailToken
    }
  },
}

export default emailPlugin
