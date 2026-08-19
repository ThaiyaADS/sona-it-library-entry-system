import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getISTStartOfDay, formatInIST } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const today = getISTStartOfDay();

    const visits = await prisma.libraryVisit.findMany({
      where: { entryTime: { gte: today } },
      orderBy: { entryTime: "desc" },
      include: {
        user: {
          select: {
            name: true,
            identifier: true,
            department: true,
            role: true,
          }
        }
      }
    });

    // Create CSV content
    const headers = "Name,Identifier,Role,Department,Entry Time,Exit Time,Duration (Mins),Status\n";
    const rows = visits.map(v => {
      const entryStr = v.entryTime ? formatInIST(v.entryTime, "timeWithSeconds") : "";
      const exitStr = v.exitTime ? formatInIST(v.exitTime, "timeWithSeconds") : "";
      const duration = v.durationMinutes || "";
      // Clean quotes
      const cleanName = v.user.name.replace(/"/g, '""');
      const cleanDept = v.user.department.replace(/"/g, '""');
      return `"${cleanName}","${v.user.identifier}","${v.user.role}","${cleanDept}","${entryStr}","${exitStr}","${duration}","${v.status}"`;
    }).join("\n");

    const csvContent = headers + rows;

    const response = new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=library_visits_today_${formatInIST(new Date(), "isoDate")}.csv`,
      }
    });

    return response;
  } catch (error) {
    console.error("Export failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
