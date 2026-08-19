import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReportsData } from "@/actions/reports";
import ReportsClient from "@/components/ReportsClient";

export const metadata = {
  title: "Reports & Analytics - Sona IT Library",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    role?: string;
    department?: string;
  }>;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const resolvedParams = await searchParams;
  const reportsRes = await getReportsData({
    startDate: resolvedParams.startDate,
    endDate: resolvedParams.endDate,
    role: resolvedParams.role,
    department: resolvedParams.department,
  });
  
  if (!reportsRes.success) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error Loading Reports</h1>
        <p className="text-slate-500 mt-2">{reportsRes.message || "Please check server logs."}</p>
      </div>
    );
  }

  return (
    <ReportsClient
      initialVisits={reportsRes.visits}
      initialStats={reportsRes.stats}
      departments={reportsRes.departments}
    />
  );
}
