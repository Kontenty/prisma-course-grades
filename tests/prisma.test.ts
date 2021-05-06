import { PrismaClient } from '@prisma/client'

describe('Prisma Client', () => {
  let prisma = new PrismaClient()

  beforeAll(async () => {
    await prisma.$connect()
  })
  afterAll(async () => {
    await prisma.$disconnect()
  })
  test('prisma user query', async () => {
    const data = await prisma.user.findMany({ take: 1, select: { id: true } })
    expect(data).toBeTruthy()
  })
})
