"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";

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

// Entity extraction parser to recognize records from unstructured PDF and Word document texts
function parseTextLines(text: string, type: "STUDENT" | "FACULTY"): any[] {
  const lines = text.split(/\r?\n/);
  const rows: any[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Skip column headers if matching header names
    const lowerLine = line.toLowerCase();
    if (
      (lowerLine.includes("name") && (lowerLine.includes("department") || lowerLine.includes("email"))) ||
      lowerLine.includes("template file") ||
      lowerLine.includes("admissionnumber,")
    ) {
      continue;
    }

    let email = "";
    let registerNumber = "";
    let identifier = "";
    let department = "Unknown";
    const course = null;
    let year = null;
    let section = null;
    let designation = null;

    // 1. Extract Email
    const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (emailMatch) {
      email = emailMatch[0];
      line = line.replace(email, " ");
    }

    if (type === "STUDENT") {
      // 2. Extract Register Number (12-15 digits)
      const regMatch = line.match(/\b\d{12,15}\b/);
      if (regMatch) {
        registerNumber = regMatch[0];
        line = line.replace(registerNumber, " ");
      }

      // 3. Extract Student Admission Number (e.g. 23ADSBE179, 23ADSBE185L, 23ADSBE001)
      const idMatch = line.match(/\b\d{2}[A-Za-z]{2,6}\d{2,4}[L]?\b/i);
      if (idMatch) {
        identifier = idMatch[0].toUpperCase();
        line = line.replace(idMatch[0], " ");
      }

      // 4. Extract Year (IV, III, II, I)
      const yearMatch = line.match(/\b(IV|III|II|I)\b/i);
      if (yearMatch) {
        year = yearMatch[0].toUpperCase();
        line = line.replace(yearMatch[0], " ");
      }

      // 5. Extract Section (A, B, C)
      const secMatch = line.match(/\b(A|B|C)\b/i);
      if (secMatch) {
        section = secMatch[0].toUpperCase();
        line = line.replace(secMatch[0], " ");
      }
    } else {
      // FACULTY
      // 2. Extract Faculty ID (e.g. FAC-IT-001, FAC123)
      const idMatch = line.match(/\b(FAC|FACULTY)[-\w]*\b/i) || line.match(/\b[A-Za-z]{2,4}\d{3,4}\b/i) || line.match(/\b[A-Za-z0-9-]{4,15}\b/);
      if (idMatch) {
        identifier = idMatch[0].toUpperCase();
        line = line.replace(idMatch[0], " ");
      }

      // 3. Extract Designation (Assistant Professor, etc.)
      const desMatch = line.match(/(Assistant\s+Professor|Associate\s+Professor|Professor|HOD|Lecturer)/i);
      if (desMatch) {
        designation = desMatch[0];
        line = line.replace(desMatch[0], " ");
      }
    }

    // 6. Extract Department
    const deptMatch = line.match(/\b(ADS|IT|CSE|ECE|MECH|CIVIL|EEE)\b/i);
    if (deptMatch) {
      department = deptMatch[0].toUpperCase();
      line = line.replace(deptMatch[0], " ");
    }

    // 7. Extract Name (whatever words are left, clean up special characters)
    let cleanedLine = line.replace(/[,;|\t\-_\(\)\*]/g, " ").replace(/\s+/g, " ").trim();
    cleanedLine = cleanedLine.replace(/^\d+\s+/, "").replace(/\s+\d+$/, "").trim();

    if (!cleanedLine || cleanedLine.length < 2) continue; // Skip if no name parsed

    const name = cleanedLine;

    // Fallback if identifier is not found
    if (!identifier) {
      if (registerNumber) {
        identifier = registerNumber;
      } else {
        continue;
      }
    }

    rows.push({
      identifier,
      name,
      department,
      email: email || null,
      registerNumber: registerNumber || null,
      year: year || "I",
      section: section || "A",
      designation: designation || "Faculty"
    });
  }

  return rows;
}

async function importStudents(rows: any[]) {
  let successCount = 0;
  let skipCount = 0;
  
  for (const rawRow of rows) {
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
}

async function importFaculty(rows: any[]) {
  let successCount = 0;
  let skipCount = 0;
  
  for (const rawRow of rows) {
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
}

export async function uploadStudentsCSV(data: { rows: any[] }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }
  return importStudents(data.rows);
}

export async function uploadFacultyCSV(data: { rows: any[] }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }
  return importFaculty(data.rows);
}

export async function uploadDocument(formData: FormData, type: "STUDENT" | "FACULTY") {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, message: "No file was uploaded." };
  }

  try {
    const filename = file.name;
    const extension = filename.split(".").pop()?.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    let parsedRows: any[] = [];

    if (extension === "csv") {
      text = buffer.toString("utf-8");
      const results = Papa.parse(text, { header: true, skipEmptyLines: true });
      parsedRows = results.data;
    } else if (extension === "pdf") {
      const pdfParse = (await import("pdf-parse")) as any;
      const pdfData = await pdfParse(buffer);
      text = pdfData.text || "";
      parsedRows = parseTextLines(text, type);
    } else if (extension === "docx" || extension === "doc") {
      const mammoth = await import("mammoth");
      const docxData = await mammoth.extractRawText({ buffer });
      text = docxData.value || "";
      parsedRows = parseTextLines(text, type);
    } else {
      return { success: false, message: "Unsupported file format. Please upload CSV, PDF, or Word documents." };
    }

    if (parsedRows.length === 0) {
      return { success: false, message: "No records could be identified in the uploaded document." };
    }

    const res = type === "STUDENT" 
      ? await importStudents(parsedRows) 
      : await importFaculty(parsedRows);

    return res;
  } catch (error: any) {
    console.error("Document upload error:", error);
    return { success: false, message: `Failed to parse document: ${error.message || error}` };
  }
}
