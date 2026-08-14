"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function uploadStudentsCSV(data: { rows: any[] }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    let successCount = 0;
    
    // Process sequentially to avoid connection pool exhaustion
    for (const row of data.rows) {
      if (!row.identifier || !row.name) continue; // Skip invalid rows
      
      const identifier = row.identifier.toString().trim();
      const barcode = row.barcode ? row.barcode.toString().trim() : identifier;
      
      const registerNumber = (row.registerNumber || row.register_number || "").toString().trim() || null;
      // Default password is their Register Number if available, otherwise Admission Number (identifier)
      const defaultPassword = registerNumber || identifier;
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      await prisma.user.upsert({
        where: { identifier },
        update: {
           name: row.name,
           department: row.department || "Unknown",
           course: row.course || null,
           registerNumber: registerNumber,
           year: row.year || null,
           section: row.section || null,
           email: row.email || null,
           phone: row.phone || null,
           barcode: barcode,
           role: "STUDENT"
        },
        create: {
          role: "STUDENT",
          identifier,
          name: row.name,
          department: row.department || "Unknown",
          course: row.course || null,
          registerNumber: registerNumber,
          year: row.year || null,
          section: row.section || null,
          email: row.email || null,
          phone: row.phone || null,
          barcode: barcode,
          passwordHash,
        },
      });
      successCount++;
    }

    revalidatePath("/admin/students");
    return { success: true, message: `Successfully imported ${successCount} students.` };
  } catch (error) {
    console.error("Bulk upload error:", error);
    return { success: false, message: "An error occurred during bulk upload." };
  }
}

export async function uploadFacultyCSV(data: { rows: any[] }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    let successCount = 0;
    
    for (const row of data.rows) {
      if (!row.identifier || !row.name) continue;
      
      const identifier = row.identifier.toString().trim();
      const barcode = row.barcode ? row.barcode.toString().trim() : identifier;
      
      // Default password is their identifier
      const defaultPassword = row.password ? row.password.toString() : identifier;
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      await prisma.user.upsert({
        where: { identifier },
        update: {
           name: row.name,
           department: row.department || "Unknown",
           designation: row.designation || "Faculty",
           email: row.email || null,
           phone: row.phone || null,
           barcode: barcode,
           role: "FACULTY"
        },
        create: {
          role: "FACULTY",
          identifier,
          name: row.name,
          department: row.department || "Unknown",
          designation: row.designation || "Faculty",
          email: row.email || null,
          phone: row.phone || null,
          barcode: barcode,
          passwordHash,
        },
      });
      successCount++;
    }

    revalidatePath("/admin/faculty");
    return { success: true, message: `Successfully imported ${successCount} faculty members.` };
  } catch (error) {
    console.error("Bulk upload error:", error);
    return { success: false, message: "An error occurred during bulk upload." };
  }
}
