import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import CsvUploader from "@/components/CsvUploader";
import UserFormModal from "@/components/UserFormModal";
import StudentTable from "@/components/StudentTable";

export const metadata = {
  title: "Student Management - Sona IT Library",
};

export default async function AdminStudents() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
           <Users className="w-8 h-8 mr-3 text-blue-600" /> Students
        </h1>
        <div className="flex gap-2">
           <CsvUploader type="STUDENT" />
           <UserFormModal type="STUDENT" mode="ADD" />
        </div>
      </div>

      <StudentTable initialStudents={students} />
    </div>
  );
}
