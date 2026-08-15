"use server";

import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginUser(formData: FormData, role: "STUDENT" | "FACULTY") {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { error: "All fields are required" };
  }

  const user = await prisma.user.findUnique({
    where: { identifier },
  });

  if (!user || user.role !== role) {
    return { error: "Invalid credentials" };
  }

  if (role === "STUDENT") {
    const isRegisterNumberMatch = user.registerNumber && password.trim() === user.registerNumber.trim();
    const isPasswordHashMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isRegisterNumberMatch && !isPasswordHashMatch) {
      return { error: "Invalid credentials" };
    }
  } else {
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid credentials" };
    }
  }

  if (!user.isActive) {
    return { error: "Account is inactive. Contact admin." };
  }

  // Create JWT
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user: { id: user.id, role: user.role, name: user.name }, expires });

  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true });

  redirect(`/${role.toLowerCase()}/dashboard`);
}

export async function loginAdmin(formData: FormData, redirectPath?: string) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "All fields are required" };
  }

  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) {
    return { error: "Invalid credentials" };
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  // Create JWT
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user: { id: admin.id, role: "ADMIN", name: admin.username }, expires });

  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true });

  const targetRedirect = redirectPath && redirectPath.startsWith("/") && !redirectPath.startsWith("//")
    ? redirectPath
    : "/admin/dashboard";

  redirect(targetRedirect);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}
