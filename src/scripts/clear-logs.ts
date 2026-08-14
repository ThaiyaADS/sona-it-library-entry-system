import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing all library visit logs...");
  const deleted = await prisma.libraryVisit.deleteMany();
  console.log(`Successfully cleared ${deleted.count} visit logs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
