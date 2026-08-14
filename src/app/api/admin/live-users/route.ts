import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    return NextResponse.json({ liveUsers });
  } catch (error) {
    console.error("Failed to fetch live occupancy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
