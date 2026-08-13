import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CsvUploader from "@/components/CsvUploader";
import UserFormModal from "@/components/UserFormModal";
import ToggleUserButton from "@/components/ToggleUserButton";

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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
           <Users className="w-8 h-8 mr-3 text-blue-600" /> Faculty
        </h1>
        <div className="flex gap-2">
           <CsvUploader type="FACULTY" />
           <UserFormModal type="FACULTY" mode="ADD" />
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
         <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-700">Registered Faculty ({facultyMembers.length})</CardTitle>
         </CardHeader>
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white border-b">
                 <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Faculty ID</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Designation</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {facultyMembers.map((faculty) => (
                    <tr key={faculty.id} className={`border-b hover:bg-slate-50 ${!faculty.isActive ? 'opacity-60' : ''}`}>
                       <td className="px-6 py-4 font-bold text-slate-900">{faculty.name}</td>
                       <td className="px-6 py-4 font-mono text-slate-600">{faculty.identifier}</td>
                       <td className="px-6 py-4 text-slate-600">{faculty.department}</td>
                       <td className="px-6 py-4 text-slate-600">{faculty.designation}</td>
                       <td className="px-6 py-4">
                          <Badge variant={faculty.isActive ? 'default' : 'destructive'} className={faculty.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                             {faculty.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                       </td>
                       <td className="px-6 py-4 text-right flex justify-end gap-1">
                          <UserFormModal type="FACULTY" mode="EDIT" initialData={faculty} />
                          <ToggleUserButton id={faculty.id} isActive={faculty.isActive} role="FACULTY" />
                       </td>
                    </tr>
                 ))}
                 {facultyMembers.length === 0 && (
                    <tr>
                       <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No faculty found.
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
         </div>
      </Card>
    </div>
  );
}
