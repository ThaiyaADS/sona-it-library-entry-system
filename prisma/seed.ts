import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  const adminPassword = await bcrypt.hash("itlib123", 10);
  const userPassword = await bcrypt.hash("password123", 10);

  // 1. Create Default Admin
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@sonatech.ac.in",
      passwordHash: adminPassword,
    },
  });
  console.log("Admin seeded.");

  // 2. Create Sample Students
  const students = [
    {
      identifier: "23ADSBE179",
      name: "THAIYANANTH V S",
      department: "Artificial Intelligence and Data Science",
      course: "B.Tech",
      year: "IV",
      barcode: "23ADSBE179",
    },
    {
      identifier: "23ADSBE180",
      name: "Arun Kumar",
      department: "Artificial Intelligence and Data Science",
      course: "B.Tech",
      year: "IV",
      barcode: "23ADSBE180",
    },
    {
      identifier: "23ITBE101",
      name: "Priya Darshini",
      department: "Information Technology",
      course: "B.Tech",
      year: "III",
      barcode: "23ITBE101",
    },
  ];

  for (const student of students) {
    await prisma.user.upsert({
      where: { identifier: student.identifier },
      update: {},
      create: {
        role: "STUDENT",
        identifier: student.identifier,
        name: student.name,
        department: student.department,
        course: student.course,
        year: student.year,
        barcode: student.barcode,
        passwordHash: userPassword,
      },
    });
  }
  console.log("Students seeded.");

  // 3. Create Sample Faculty
  const facultyMembers = [
    {
      identifier: "FAC-IT-001",
      name: "Dr. Y. Suresh",
      department: "Information Technology",
      designation: "Assistant Professor",
      barcode: "FAC-IT-001",
    },
    {
      identifier: "FAC-IT-002",
      name: "Dr. K. Ramesh",
      department: "Information Technology",
      designation: "Professor",
      barcode: "FAC-IT-002",
    },
  ];

  for (const faculty of facultyMembers) {
    await prisma.user.upsert({
      where: { identifier: faculty.identifier },
      update: {},
      create: {
        role: "FACULTY",
        identifier: faculty.identifier,
        name: faculty.name,
        department: faculty.department,
        designation: faculty.designation,
        barcode: faculty.barcode,
        passwordHash: userPassword,
      },
    });
  }
  console.log("Faculty seeded.");

  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
