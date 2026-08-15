"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Parse scientific notation numbers (e.g. 6.17823E+13) from Excel back to clean numeric strings
function parseExcelNumericString(val: any): string {
  if (val === undefined || val === null) return "";
  const s = val.toString().trim();
  if (!s) return "";
  
  if (/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(s)) {
    try {
      const num = Number(s);
      if (!isNaN(num)) {
        return BigInt(Math.round(num)).toString();
      }
    } catch (e) {
      // ignore
    }
  }
  return s;
}

// Normalize row keys to allow case insensitivity, spaces, underscores
function normalizeRow(row: any) {
  const normalized: any = {};
  for (const key of Object.keys(row)) {
    const cleanKey = key.trim().toLowerCase().replace(/[\s_-]+/g, "");
    
    if (
      cleanKey === "identifier" || 
      cleanKey === "admissionnumber" || 
      cleanKey === "admissionno" || 
      cleanKey === "rollno" || 
      cleanKey === "rollnumber" || 
      cleanKey === "id" ||
      cleanKey === "facultyid"
    ) {
      normalized.identifier = row[key];
    }
    else if (
      cleanKey === "name" || 
      cleanKey === "studentname" || 
      cleanKey === "facultyname" || 
      cleanKey === "fullname"
    ) {
      normalized.name = row[key];
    }
    else if (
      cleanKey === "registernumber" || 
      cleanKey === "regno" || 
      cleanKey === "registerno"
    ) {
      normalized.registerNumber = row[key];
    }
    else if (
      cleanKey === "department" || 
      cleanKey === "dept"
    ) {
      normalized.department = row[key];
    }
    else if (
      cleanKey === "course" || 
      cleanKey === "class"
    ) {
      normalized.course = row[key];
    }
    else if (
      cleanKey === "year"
    ) {
      normalized.year = row[key];
    }
    else if (
      cleanKey === "section"
    ) {
      normalized.section = row[key];
    }
    else if (
      cleanKey === "designation"
    ) {
      normalized.designation = row[key];
    }
    else if (
      cleanKey === "barcode" || 
      cleanKey === "barcodenumber"
    ) {
      normalized.barcode = row[key];
    }
    else if (
      cleanKey === "email" || 
      cleanKey === "emailid"
    ) {
      normalized.email = row[key];
    }
    else if (
      cleanKey === "phone" || 
      cleanKey === "phonenumber" || 
      cleanKey === "mobile"
    ) {
      normalized.phone = row[key];
    }
    else {
      normalized[key] = row[key];
    }
  }
  return normalized;
}

export async function uploadStudentsCSV(data: { rows: any[] }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    let successCount = 0;
    let skipCount = 0;
    
    for (const rawRow of data.rows) {
      const row = normalizeRow(rawRow);
      
      if (!row.identifier || !row.name) {
        skipCount++;
        continue;
      }
      
      try {
        const identifier = parseExcelNumericString(row.identifier);
        const name = row.name.toString().trim();
        const barcodeRaw = row.barcode ? row.barcode.toString().trim() : identifier;
        const barcode = parseExcelNumericString(barcodeRaw);
        
        const registerNumberRaw = row.registerNumber || "";
        const registerNumber = parseExcelNumericString(registerNumberRaw) || null;
        
        // Skip if barcode is already taken by a different user
        const existingBarcodeUser = await prisma.user.findUnique({ where: { barcode } });
        if (existingBarcodeUser && existingBarcodeUser.identifier !== identifier) {
          console.warn(`Skipping row due to barcode conflict. Barcode "${barcode}" is already taken by user "${existingBarcodeUser.identifier}".`);
          skipCount++;
          continue;
        }

        const defaultPassword = registerNumber || identifier;
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        await prisma.user.upsert({
          where: { identifier },
          update: {
            name,
            department: row.department ? row.department.toString().trim() : "Unknown",
            course: row.course ? row.course.toString().trim() : null,
            registerNumber,
            year: row.year ? row.year.toString().trim() : null,
            section: row.section ? row.section.toString().trim() : null,
            email: row.email ? row.email.toString().trim() : null,
            phone: row.phone ? row.phone.toString().trim() : null,
            barcode,
            role: "STUDENT"
          },
          create: {
            role: "STUDENT",
            identifier,
            name,
            department: row.department ? row.department.toString().trim() : "Unknown",
            course: row.course ? row.course.toString().trim() : null,
            registerNumber,
            year: row.year ? row.year.toString().trim() : null,
            section: row.section ? row.section.toString().trim() : null,
            email: row.email ? row.email.toString().trim() : null,
            phone: row.phone ? row.phone.toString().trim() : null,
            barcode,
            passwordHash,
          },
        });
        successCount++;
      } catch (rowError) {
        console.error("Error processing row:", rowError);
        skipCount++;
      }
    }

    revalidatePath("/admin/students");
    return { 
      success: true, 
      message: `Successfully imported/updated ${successCount} students.${skipCount > 0 ? ` ${skipCount} entries skipped due to duplicate barcodes or invalid data.` : ""}` 
    };
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
    let skipCount = 0;
    
    for (const rawRow of data.rows) {
      const row = normalizeRow(rawRow);
      
      if (!row.identifier || !row.name) {
        skipCount++;
        continue;
      }
      
      try {
        const identifier = parseExcelNumericString(row.identifier);
        const name = row.name.toString().trim();
        const barcodeRaw = row.barcode ? row.barcode.toString().trim() : identifier;
        const barcode = parseExcelNumericString(barcodeRaw);
        
        // Skip if barcode is already taken by a different user
        const existingBarcodeUser = await prisma.user.findUnique({ where: { barcode } });
        if (existingBarcodeUser && existingBarcodeUser.identifier !== identifier) {
          console.warn(`Skipping row due to barcode conflict. Barcode "${barcode}" is already taken by user "${existingBarcodeUser.identifier}".`);
          skipCount++;
          continue;
        }

        const defaultPassword = identifier;
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        await prisma.user.upsert({
          where: { identifier },
          update: {
            name,
            department: row.department ? row.department.toString().trim() : "Unknown",
            designation: row.designation ? row.designation.toString().trim() : "Faculty",
            email: row.email ? row.email.toString().trim() : null,
            phone: row.phone ? row.phone.toString().trim() : null,
            barcode,
            role: "FACULTY"
          },
          create: {
            role: "FACULTY",
            identifier,
            name,
            department: row.department ? row.department.toString().trim() : "Unknown",
            designation: row.designation ? row.designation.toString().trim() : "Faculty",
            email: row.email ? row.email.toString().trim() : null,
            phone: row.phone ? row.phone.toString().trim() : null,
            barcode,
            passwordHash,
          },
        });
        successCount++;
      } catch (rowError) {
        console.error("Error processing row:", rowError);
        skipCount++;
      }
    }

    revalidatePath("/admin/faculty");
    return { 
      success: true, 
      message: `Successfully imported/updated ${successCount} faculty members.${skipCount > 0 ? ` ${skipCount} entries skipped due to duplicate barcodes or invalid data.` : ""}` 
    };
  } catch (error) {
    console.error("Bulk upload error:", error);
    return { success: false, message: "An error occurred during bulk upload." };
  }
}
