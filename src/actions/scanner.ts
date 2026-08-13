"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { differenceInMinutes } from "date-fns";

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

    if (activeVisit) {
      // 3. EXIT Logic
      // Optional: Prevent duplicate rapid scans (e.g. exit within 1 minute of entry)
      const minutesSinceEntry = differenceInMinutes(now, activeVisit.entryTime);
      if (minutesSinceEntry < 1) {
         return {
           success: false,
           message: "Please wait before scanning again.",
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
        message: "EXIT RECORDED",
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
      // Check if they just exited a few seconds ago
      const lastVisit = await prisma.libraryVisit.findFirst({
         where: { userId: user.id },
         orderBy: { exitTime: 'desc' }
      });
      if (lastVisit?.exitTime) {
         const minutesSinceExit = differenceInMinutes(now, lastVisit.exitTime);
         if (minutesSinceExit < 1) {
            return { success: false, message: "Please wait before scanning again." };
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
        message: "ENTRY RECORDED",
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
