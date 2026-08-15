import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserCheck } from "lucide-react";
import AdminFormModal from "@/components/AdminFormModal";
import AdminTable from "@/components/AdminTable";

export const metadata = {
  title: "Admin Account Management - Sona IT Library",
};

export default async function AdminManagementPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const admins = await prisma.admin.findMany({
    orderBy: { username: "asc" },
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
           <UserCheck className="w-8 h-8 mr-3 text-blue-600" /> Admin Users
        </h1>
        <AdminFormModal mode="ADD" />
      </div>

      <AdminTable initialAdmins={admins} />
    </div>
  );
}
