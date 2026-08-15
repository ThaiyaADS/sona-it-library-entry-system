"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { differenceInMinutes, differenceInSeconds, format } from "date-fns";
import { getSession } from "@/lib/auth";

export type ScanResult = {
  success: boolean;
  message: string;
  type?: "ENTRY" | "EXIT";
  user?: {
    name: string;
    identifier: string;
    department: string;
    designation?: string | null;
    course?: string | null;
    role: string;
  };
  entryTime?: Date;
  exitTime?: Date;
  duration?: string;
};

export async function processScan(barcode: string): Promise<ScanResult> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized. Admin session required." };
  }

  if (!barcode) {
    return { success: false, message: "Barcode cannot be empty." };
  }

  try {
    // 1. Find User by Barcode (Student or Faculty)
    const user = await prisma.user.findUnique({
      where: { barcode },
    });

    if (!user) {
      return {
        success: false,
        message: "User Not Found. Please verify the admission/faculty number.",
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        message: "Access Restricted. Your library access is currently inactive.",
      };
    }

    // 2. Check for Active Visit
    const activeVisit = await prisma.libraryVisit.findFirst({
      where: {
        userId: user.id,
        exitTime: null,
      },
      orderBy: {
        entryTime: "desc",
      },
    });

    const now = new Date();
    const istTimeStr = now.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    if (activeVisit) {
      // 3. EXIT Logic
      // Prevent duplicate rapid scans (exit within 1 minute / 60 seconds of entry)
      const secondsSinceEntry = differenceInSeconds(now, activeVisit.entryTime);
      if (secondsSinceEntry < 60) {
         const timeLeft = 60 - secondsSinceEntry;
         return {
           success: false,
           message: `Scan Denied. Please wait. You can exit in ${timeLeft} second${timeLeft !== 1 ? 's' : ''}.`,
         };
      }

      const durationMinutes = differenceInMinutes(now, activeVisit.entryTime);
      
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const durationStr = `${hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''} ` : ''}${minutes} min${minutes !== 1 ? 's' : ''}`;

      await prisma.libraryVisit.update({
        where: { id: activeVisit.id },
        data: {
          exitTime: now,
          durationMinutes: durationMinutes,
          status: "COMPLETED",
        },
      });

      revalidatePath("/scanner");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/live");
      
      return {
        success: true,
        message: `Goodbye, ${user.name}! Checked out at ${istTimeStr}. Spent: ${durationStr}`,
        type: "EXIT",
        user: {
          name: user.name,
          identifier: user.identifier,
          department: user.department,
          designation: user.designation,
          course: user.course,
          role: user.role,
        },
        entryTime: activeVisit.entryTime,
        exitTime: now,
        duration: durationStr,
      };
    } else {
      // 4. ENTRY Logic
      // Check if they just exited less than 1 minute ago
      const lastVisit = await prisma.libraryVisit.findFirst({
         where: { userId: user.id },
         orderBy: { exitTime: 'desc' }
      });
      if (lastVisit?.exitTime) {
         const secondsSinceExit = differenceInSeconds(now, lastVisit.exitTime);
         if (secondsSinceExit < 60) {
            const timeLeft = 60 - secondsSinceExit;
            return { 
               success: false, 
               message: `Scan Denied. Please wait. You can enter in ${timeLeft} second${timeLeft !== 1 ? 's' : ''}.` 
            };
         }
      }

      await prisma.libraryVisit.create({
        data: {
          userId: user.id,
          entryTime: now,
          status: "INSIDE",
        },
      });

      revalidatePath("/scanner");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/live");

      return {
        success: true,
        message: `Welcome, ${user.name}! Checked in at ${istTimeStr}`,
        type: "ENTRY",
        user: {
          name: user.name,
          identifier: user.identifier,
          department: user.department,
          designation: user.designation,
          course: user.course,
          role: user.role,
        },
        entryTime: now,
      };
    }
  } catch (error) {
    console.error("Scanner error:", error);
    return {
      success: false,
      message: "Unable to record scan. Please try again.",
    };
  }
}

export async function getRecentScans() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return [];
  }

  const recentVisits = await prisma.libraryVisit.findMany({
    take: 10,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          identifier: true,
          department: true,
          role: true,
        },
      },
    },
  });

  return recentVisits;
}
