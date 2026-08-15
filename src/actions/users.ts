"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(data: any) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const identifier = data.identifier.toString().trim();
    const barcode = data.barcode ? data.barcode.toString().trim() : identifier;
    const registerNumber = data.registerNumber ? data.registerNumber.toString().trim() : null;
    const defaultPassword = data.role === "STUDENT" && registerNumber ? registerNumber : identifier;
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { identifier } });
    if (existing) {
       return { success: false, message: "User with this Identifier already exists." };
    }

    await prisma.user.create({
      data: {
        role: data.role,
        identifier,
        name: data.name,
        department: data.department || "Unknown",
        course: data.course || null,
        registerNumber: data.registerNumber || null,
        year: data.year || null,
        section: data.section || null,
        designation: data.designation || null,
        email: data.email || null,
        phone: data.phone || null,
        barcode: barcode,
        passwordHash,
      },
    });

    const path = data.role === "STUDENT" ? "/admin/students" : "/admin/faculty";
    revalidatePath(path);
    return { success: true, message: `Successfully added ${data.name}.` };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, message: "Failed to create user." };
  }
}

export async function updateUser(id: string, data: any) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        identifier: data.identifier,
        barcode: data.barcode || data.identifier,
        department: data.department,
        course: data.course || null,
        registerNumber: data.registerNumber || null,
        year: data.year || null,
        section: data.section || null,
        designation: data.designation || null,
        email: data.email || null,
        phone: data.phone || null,
      },
    });

    const path = data.role === "STUDENT" ? "/admin/students" : "/admin/faculty";
    revalidatePath(path);
    return { success: true, message: `Successfully updated ${data.name}.` };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, message: "Failed to update user." };
  }
}

export async function toggleUserStatus(id: string, currentStatus: boolean, role: string) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        isActive: !currentStatus,
      },
    });

    const path = role === "STUDENT" ? "/admin/students" : "/admin/faculty";
    revalidatePath(path);
    return { success: true, message: `User status changed successfully.` };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { success: false, message: "Failed to change user status." };
  }
}

export async function deleteUser(id: string, role: "STUDENT" | "FACULTY") {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // Delete visits first to satisfy foreign key constraints
    await prisma.libraryVisit.deleteMany({
      where: { userId: id }
    });

    // Delete the user record
    await prisma.user.delete({
      where: { id }
    });

    const path = role === "STUDENT" ? "/admin/students" : "/admin/faculty";
    revalidatePath(path);
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Failed to delete user." };
  }
}

export async function deleteUsers(ids: string[], role: "STUDENT" | "FACULTY") {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // Delete visits first
    await prisma.libraryVisit.deleteMany({
      where: { userId: { in: ids } }
    });

    // Delete users
    await prisma.user.deleteMany({
      where: { id: { in: ids } }
    });

    const path = role === "STUDENT" ? "/admin/students" : "/admin/faculty";
    revalidatePath(path);
    return { success: true, message: `Successfully deleted ${ids.length} users.` };
  } catch (error) {
    console.error("Delete users bulk error:", error);
    return { success: false, message: "Failed to delete users." };
  }
}
