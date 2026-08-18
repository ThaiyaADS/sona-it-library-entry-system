import ScannerInterface from "@/components/ScannerInterface";
import { getRecentScans } from "@/actions/scanner";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Library Scanner - Sona IT Library",
};

export default async function AdminScannerPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login?redirect=/admin/scanner");
  }

  const recentScans = await getRecentScans();
  const activeCount = await prisma.libraryVisit.count({
    where: { exitTime: null }
  });
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <ScannerInterface initialScans={recentScans} initialActiveCount={activeCount} isEmbedded={true} />
    </div>
  );
}
