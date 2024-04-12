// import prisma from "../DB/db.config";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const blog1 = await prisma.blog.upsert({
    //upsert removes errors related to accidentally trying to insert the same record twice.
    where: { id: 2 }, // The upsert function will only create a new article if no article matches the where condition
    update: {},
    create: {
      title: 'a very sad blog',
      content:
        'A beautiful blog createt by robert in the memory of his beloved',
      author: 'Karun KC',
      likes: 1500,
    },
  });
}
main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
