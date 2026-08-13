import ScannerInterface from "@/components/ScannerInterface";
import { getRecentScans } from "@/actions/scanner";

export const metadata = {
  title: "Library Scanner - Sona IT",
};

export default async function ScannerPage() {
  const recentScans = await getRecentScans();
  
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <ScannerInterface initialScans={recentScans} />
    </div>
  );
}
