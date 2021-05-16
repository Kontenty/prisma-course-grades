import { Algorithm } from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const { SENDGRID_API_KEY, SENDGRID_EMAIL } = process.env

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'rtzPU5Ft+CX1VO0JHqizz7ZL9ABeLWwsqaAxOd8UjJrgefoI3/B1FfzsVTPw/mqGqHd9JnTNZwxnOouoO443BMjKOIoUivQzKdfVnQ4CS5pCJHeW7d9MJIqXCYS+lCcpLFZQ5s6NvXpQ22pFhAx8gzlS7eQb0kg1oF/bTVa0E3YemWuhgRUz3IEHsRPo+1UyIlfuLiurt7OJzXh+vitxHByvJZWAjPOdym8lSSUP64UdMQaD0ultpGzgR6u/qcJzKWu/6fvBScMeSk6Fo8wcR3JKuR56ctPw42RVWkA9mZjBZdka0zaT386APL0p3v6BwJszZr6+hdWAL/YtJ4btAg=='
const JWT_ALGO: Algorithm = 'HS256'

export const PORT = process.env.PORT || 5000
export const HOST = process.env.HOST || 'localhost'

const config = {
  JWT_SECRET,
  JWT_ALGO,
  API_AUTH_STATEGY: 'API',
  SENDGRID_API_KEY,
  SENDGRID_EMAIL,
}
export default config
