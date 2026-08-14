"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        where.entryTime.gte = start;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.entryTime.lte = end;
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
