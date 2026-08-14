"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

  return {
    user,
    stats: {
      totalVisits,
      totalMinutes
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

  return {
    user,
    stats: {
      totalVisits,
      totalMinutes
    },
    currentVisit
  };
}

export async function getAdminDashboardData() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  return {
    stats: {
      totalStudents,
      totalFaculty,
      todaysVisits,
      insideUsers,
      completedToday,
      totalMinutesToday
    },
    liveUsers
  };
}

export async function getPublicLibraryStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

