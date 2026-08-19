"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getISTStartOfDay, getISTStartOfWeek, getISTHour } from "@/lib/utils";

const getStartOfWeek = () => {
  return getISTStartOfWeek();
};

export async function getStudentDashboardData() {
  const session = await getSession();
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      visits: {
        orderBy: { entryTime: "desc" },
        take: 10,
      }
    }
  });

  if (!user) throw new Error("User not found");

  const totalVisits = await prisma.libraryVisit.count({
    where: { userId: user.id }
  });

  const allVisits = await prisma.libraryVisit.findMany({
    where: { userId: user.id },
    select: { durationMinutes: true }
  });

  const totalMinutes = allVisits.reduce((acc, visit) => acc + (visit.durationMinutes || 0), 0);
  
  const currentVisit = await prisma.libraryVisit.findFirst({
    where: { userId: user.id, exitTime: null }
  });

  const startOfWeek = getStartOfWeek();
  const weeklyVisits = await prisma.libraryVisit.findMany({
    where: {
      userId: user.id,
      entryTime: { gte: startOfWeek }
    },
    select: { entryTime: true }
  });

  const checkinDays = weeklyVisits.map(v => {
    const day = new Date(v.entryTime).getDay();
    return day === 0 ? 6 : day - 1; // 0 for Mon, 1 for Tue, etc.
  });
  const uniqueDays = Array.from(new Set(checkinDays));

  const completedVisits = allVisits.filter(v => v.durationMinutes !== null && v.durationMinutes > 0);
  const avgDurationMinutes = completedVisits.length > 0
    ? Math.round(completedVisits.reduce((acc, v) => acc + (v.durationMinutes || 0), 0) / completedVisits.length)
    : 0;

  return {
    user,
    stats: {
      totalVisits,
      totalMinutes,
      avgDurationMinutes,
      uniqueDays
    },
    currentVisit
  };
}

export async function getFacultyDashboardData() {
  const session = await getSession();
  if (!session || session.user.role !== "FACULTY") {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      visits: {
        orderBy: { entryTime: "desc" },
        take: 10,
      }
    }
  });

  if (!user) throw new Error("User not found");

  const totalVisits = await prisma.libraryVisit.count({
    where: { userId: user.id }
  });

  const allVisits = await prisma.libraryVisit.findMany({
    where: { userId: user.id },
    select: { durationMinutes: true }
  });

  const totalMinutes = allVisits.reduce((acc, visit) => acc + (visit.durationMinutes || 0), 0);
  
  const currentVisit = await prisma.libraryVisit.findFirst({
    where: { userId: user.id, exitTime: null }
  });

  const startOfWeek = getStartOfWeek();
  const weeklyVisits = await prisma.libraryVisit.findMany({
    where: {
      userId: user.id,
      entryTime: { gte: startOfWeek }
    },
    select: { entryTime: true }
  });

  const checkinDays = weeklyVisits.map(v => {
    const day = new Date(v.entryTime).getDay();
    return day === 0 ? 6 : day - 1;
  });
  const uniqueDays = Array.from(new Set(checkinDays));

  const completedVisits = allVisits.filter(v => v.durationMinutes !== null && v.durationMinutes > 0);
  const avgDurationMinutes = completedVisits.length > 0
    ? Math.round(completedVisits.reduce((acc, v) => acc + (v.durationMinutes || 0), 0) / completedVisits.length)
    : 0;

  return {
    user,
    stats: {
      totalVisits,
      totalMinutes,
      avgDurationMinutes,
      uniqueDays
    },
    currentVisit
  };
}

export async function getAdminDashboardData() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const today = getISTStartOfDay();

  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  const totalFaculty = await prisma.user.count({ where: { role: "FACULTY" } });

  const todaysVisits = await prisma.libraryVisit.count({
    where: { entryTime: { gte: today } }
  });

  const insideUsers = await prisma.libraryVisit.count({
    where: { exitTime: null }
  });

  const completedToday = await prisma.libraryVisit.count({
    where: { exitTime: { not: null }, entryTime: { gte: today } }
  });

  const allVisitsToday = await prisma.libraryVisit.findMany({
     where: { entryTime: { gte: today } },
     select: { durationMinutes: true }
  });
  
  const totalMinutesToday = allVisitsToday.reduce((acc, visit) => acc + (visit.durationMinutes || 0), 0);

  const liveUsers = await prisma.libraryVisit.findMany({
     where: { exitTime: null },
     orderBy: { entryTime: "desc" },
     include: {
        user: {
           select: {
              name: true,
              identifier: true,
              department: true,
              role: true,
              course: true,
              designation: true,
           }
        }
     }
  });

  const visitsToday = await prisma.libraryVisit.findMany({
     where: { entryTime: { gte: today } },
     select: { entryTime: true }
  });

  const hourlyStats = Array.from({ length: 12 }, (_, i) => {
     const hour = i + 8; // 8 AM to 7 PM
     const count = visitsToday.filter(v => {
        const entryHour = getISTHour(new Date(v.entryTime));
        return entryHour === hour;
     }).length;
     const displayHour = hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`;
     return { label: displayHour, count };
  });

  return {
    stats: {
      totalStudents,
      totalFaculty,
      todaysVisits,
      insideUsers,
      completedToday,
      totalMinutesToday
    },
    liveUsers,
    hourlyStats
  };
}

export async function getPublicLibraryStats() {
  try {
    const today = getISTStartOfDay();

    const activeOccupants = await prisma.libraryVisit.count({
      where: { exitTime: null }
    });

    const todaysVisits = await prisma.libraryVisit.count({
      where: { entryTime: { gte: today } }
    });

    const totalMembers = await prisma.user.count({
      where: {
        role: { in: ["STUDENT", "FACULTY"] }
      }
    });

    return {
      activeOccupants,
      todaysVisits,
      totalMembers
    };
  } catch (error) {
    console.error("Failed to fetch public library stats:", error);
    return {
      activeOccupants: 0,
      todaysVisits: 0,
      totalMembers: 0
    };
  }
}

