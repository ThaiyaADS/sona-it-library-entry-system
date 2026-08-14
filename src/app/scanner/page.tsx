import ScannerInterface from "@/components/ScannerInterface";
import { getRecentScans } from "@/actions/scanner";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Library Scanner - Sona IT",
};

export default async function ScannerPage() {
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
