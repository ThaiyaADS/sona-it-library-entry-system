"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createAdmin(data: any) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const username = data.username.toString().trim().toLowerCase();
    const email = data.email ? data.email.toString().trim() : null;
    const password = data.password.toString();

    if (!username || !password) {
      return { success: false, message: "Username and Password are required." };
    }

    // Check duplicate
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) {
      return { success: false, message: "Username is already taken." };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: {
        username,
        email,
        passwordHash
      }
    });

    revalidatePath("/admin/admins");
    return { success: true, message: `Successfully added admin ${username}.` };
  } catch (e) {
    console.error("Create admin error:", e);
    return { success: false, message: "Failed to create admin." };
  }
}

export async function updateAdmin(id: string, data: any) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const username = data.username.toString().trim().toLowerCase();
    const email = data.email ? data.email.toString().trim() : null;

    // If password is provided, update hash
    const updateData: any = { username, email };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password.toString(), 10);
    }

    await prisma.admin.update({
      where: { id },
      data: updateData
    });

    revalidatePath("/admin/admins");
    return { success: true, message: `Successfully updated admin ${username}.` };
  } catch (e) {
    console.error("Update admin error:", e);
    return { success: false, message: "Failed to update admin." };
  }
}

export async function deleteAdmin(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  // Prevent deleting the currently logged-in admin!
  const currentAdminUser = await prisma.admin.findUnique({
    where: { username: session.user.identifier }
  });
  if (currentAdminUser && currentAdminUser.id === id) {
    return { success: false, message: "Cannot delete the active logged-in admin account." };
  }

  try {
    await prisma.admin.delete({ where: { id } });
    revalidatePath("/admin/admins");
    return { success: true, message: "Admin user deleted successfully." };
  } catch (e) {
    console.error("Delete admin error:", e);
    return { success: false, message: "Failed to delete admin." };
  }
}

export async function deleteAdmins(ids: string[]) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const currentAdminUser = await prisma.admin.findUnique({
      where: { username: session.user.identifier }
    });
    const targetIds = currentAdminUser ? ids.filter(id => id !== currentAdminUser.id) : ids;

    if (targetIds.length === 0) {
      return { success: false, message: "Cannot delete the active logged-in admin account." };
    }

    await prisma.admin.deleteMany({
      where: { id: { in: targetIds } }
    });

    revalidatePath("/admin/admins");
    return { success: true, message: `Successfully deleted ${targetIds.length} admin accounts.` };
  } catch (e) {
    console.error("Bulk delete admins error:", e);
    return { success: false, message: "Failed to delete admins." };
  }
}
