"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getISTStartOfDayFromFilter, getISTEndOfDayFromFilter, calculateISTDurationMinutes } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  role?: string;
  department?: string;
}

export async function getReportsData(filters: ReportFilters = {}) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Get unique departments to populate filter dropdown
    const distinctDepartments = await prisma.user.findMany({
      select: { department: true },
      distinct: ["department"],
      orderBy: { department: "asc" }
    });
    const departments = distinctDepartments.map(d => d.department).filter(Boolean);

    // 2. Build where clause
    const where: any = {};

    // Date range
    if (filters.startDate || filters.endDate) {
      where.entryTime = {};
      if (filters.startDate) {
        where.entryTime.gte = getISTStartOfDayFromFilter(filters.startDate);
      }
      if (filters.endDate) {
        where.entryTime.lte = getISTEndOfDayFromFilter(filters.endDate);
      }
    }

    // User filters (role, department)
    const userWhere: any = {};
    if (filters.role && filters.role !== "ALL") {
      userWhere.role = filters.role;
    }
    if (filters.department && filters.department !== "ALL") {
      userWhere.department = filters.department;
    }

    if (Object.keys(userWhere).length > 0) {
      where.user = userWhere;
    }

    // 3. Query matching visits
    const visits = await prisma.libraryVisit.findMany({
      where,
      orderBy: { entryTime: "desc" },
      include: {
        user: {
          select: {
            name: true,
            identifier: true,
            role: true,
            department: true,
            course: true,
            year: true,
            designation: true
          }
        }
      }
    });

    // 4. Calculate aggregate stats for the filtered visits
    const totalVisits = visits.length;
    const completedVisits = visits.filter(v => v.exitTime !== null);
    const totalMinutes = completedVisits.reduce((acc, v) => acc + (v.durationMinutes || 0), 0);
    const avgMinutes = completedVisits.length > 0 ? Math.round(totalMinutes / completedVisits.length) : 0;

    return {
      success: true,
      departments,
      visits: JSON.parse(JSON.stringify(visits)), // Ensure pure JSON serialization for Client Component boundary
      stats: {
        totalVisits,
        totalMinutes,
        avgMinutes
      }
    };
  } catch (error) {
    console.error("Failed to fetch report data:", error);
    return {
      success: false,
      departments: [],
      visits: [],
      stats: {
        totalVisits: 0,
        totalMinutes: 0,
        avgMinutes: 0
      },
      message: "Failed to load report data."
    };
  }
}

export async function updateLibraryVisit(
  visitId: string,
  entryTimeStr: string,
  exitTimeStr: string | null
) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const parseLocalISTToUTC = (localTimeStr: string): Date => {
      let formatted = localTimeStr;
      if (!formatted.includes("Z") && !formatted.match(/[+-]\d{2}:\d{2}$/)) {
        if (formatted.split(":").length === 2) {
          formatted += ":00";
        }
        formatted += "+05:30";
      }
      return new Date(formatted);
    };

    const entryTime = parseLocalISTToUTC(entryTimeStr);
    const exitTime = exitTimeStr ? parseLocalISTToUTC(exitTimeStr) : null;

    if (exitTime && exitTime.getTime() <= entryTime.getTime()) {
      return { success: false, message: "Exit time must be after entry time." };
    }

    let durationMinutes = null;
    let status = "INSIDE";

    if (exitTime) {
      durationMinutes = calculateISTDurationMinutes(entryTime, exitTime);
      status = "COMPLETED";
    }

    await prisma.libraryVisit.update({
      where: { id: visitId },
      data: {
        entryTime,
        exitTime,
        durationMinutes,
        status,
      },
    });

    revalidatePath("/admin/reports");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/live");
    revalidatePath("/scanner");
    revalidatePath("/admin/scanner");

    return { success: true, message: "Library visit log updated successfully." };
  } catch (error) {
    console.error("Failed to update library visit:", error);
    return { success: false, message: "Failed to update log." };
  }
}

export async function deleteLibraryVisit(visitId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.libraryVisit.delete({
      where: { id: visitId },
    });

    revalidatePath("/admin/reports");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/live");
    revalidatePath("/scanner");
    revalidatePath("/admin/scanner");

    return { success: true, message: "Library visit log deleted successfully." };
  } catch (error) {
    console.error("Failed to delete library visit:", error);
    return { success: false, message: "Failed to delete log." };
  }
}
