import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import CsvUploader from "@/components/CsvUploader";
import UserFormModal from "@/components/UserFormModal";
import FacultyTable from "@/components/FacultyTable";

export const metadata = {
  title: "Faculty Management - Sona IT Library",
};

export default async function AdminFaculty() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const facultyMembers = await prisma.user.findMany({
    where: { role: "FACULTY" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
           <Users className="w-8 h-8 mr-3 text-blue-600" /> Faculty
        </h1>
        <div className="flex gap-2">
           <CsvUploader type="FACULTY" />
           <UserFormModal type="FACULTY" mode="ADD" />
        </div>
      </div>

      <FacultyTable initialFaculty={facultyMembers} />
    </div>
  );
}
