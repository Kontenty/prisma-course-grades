import { PrismaClient } from '@prisma/client'
import { add } from 'date-fns'

const prisma = new PrismaClient()

const weekFromNow = add(new Date(), { days: 7 })
const twoWeekFromNow = add(new Date(), { days: 14 })
const monthFromNow = add(new Date(), { days: 28 })

// A `main` function so that we can use async/await
async function main() {
  await prisma.testResult.deleteMany({})
  await prisma.courseEnrollment.deleteMany({})
  await prisma.test.deleteMany({})
  await prisma.course.deleteMany({})
  await prisma.token.deleteMany({})
  await prisma.user.deleteMany({})
  const grace = await prisma.user.create({
    data: {
      email: 'grace@hey.com',
      first_name: 'Grace',
      last_name: 'Bell',
      social: { facebook: 'gracebell', twitter: 'therealgracebell' },
      isAdmin: true,
    },
  })
  const course = await prisma.course.create({
    data: {
      name: 'CRUD with Prisma',
      courseDetails: 'build node backend with prisma',
      tests: {
        create: [
          { date: weekFromNow, name: 'First test' },
          { date: twoWeekFromNow, name: 'Second test' },
          { date: monthFromNow, name: 'Final exam' },
        ],
      },
      members: {
        create: {
          role: 'TEACHER',
          user: {
            connect: { email: grace.email },
          },
        },
      },
    },
    include: { tests: true },
  })

  const shakuntala = await prisma.user.create({
    data: {
      email: 'devi@prisma.io',
      first_name: 'Shakuntala',
      last_name: 'Devi',
      courses: { create: { role: 'STUDENT', course: { connect: { id: course.id } } } },
    },
  })
  const david = await prisma.user.create({
    data: {
      email: 'david@prisma.io',
      first_name: 'David',
      last_name: 'Deutsch',
      courses: { create: { role: 'STUDENT', course: { connect: { id: course.id } } } },
    },
  })

  const testResultsDavid = [650, 900, 950]
  const testResultsShakuntala = [800, 950, 910]

  for (let index = 0; index < 3; index++) {
    await prisma.testResult.create({
      data: {
        gradedBy: { connect: { email: grace.email } },
        student: { connect: { email: shakuntala.email } },
        test: { connect: { id: course.tests[index].id } },
        result: testResultsShakuntala[index],
      },
    })
    await prisma.testResult.create({
      data: {
        gradedBy: { connect: { email: grace.email } },
        student: { connect: { email: david.email } },
        test: { connect: { id: course.tests[index].id } },
        result: testResultsDavid[index],
      },
    })
  }
}

main()
  .catch((e: Error) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Disconnect Prisma Client
    await prisma.$disconnect()
  })
