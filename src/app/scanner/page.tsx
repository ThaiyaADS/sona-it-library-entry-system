import ScannerInterface from "@/components/ScannerInterface";
import { getRecentScans } from "@/actions/scanner";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Library Scanner - Sona IT",
};

export default async function ScannerPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login?redirect=/scanner");
  }

  const recentScans = await getRecentScans();
  const activeCount = await prisma.libraryVisit.count({
    where: { exitTime: null }
  });
  
  return (
    <div className="min-h-screen bg-slate-50">
      <ScannerInterface initialScans={recentScans} initialActiveCount={activeCount} />
    </div>
  );
}
