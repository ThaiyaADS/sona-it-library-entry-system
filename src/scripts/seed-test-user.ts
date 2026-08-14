import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const identifier = "23ADSBE120";
  console.log(`Checking if user ${identifier} exists...`);
  
  let user = await prisma.user.findUnique({
    where: { identifier },
  });

  if (!user) {
    console.log(`User ${identifier} not found. Creating a test student...`);
    user = await prisma.user.create({
      data: {
        identifier,
        name: "Shre Indhra Metha S S J", // Using name from screenshot as baseline
        department: "ADS",
        course: "B.Tech IT",
        role: "STUDENT",
        passwordHash: "$2a$10$T.x7T9Yc6Vb6V2V2V2V2V.V2V2V2V2V2V2V2V2V2V2V2V2V2V2V2", // dummy hash
        barcode: "23ADSBE120",
        registerNumber: "23ADSBE120",
      },
    });
    console.log(`Successfully created user:`, user);
  } else {
    console.log(`User ${identifier} already exists:`, user);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
