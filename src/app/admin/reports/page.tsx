import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const metadata = {
  title: "Reports - Sona IT Library",
};

export default async function AdminReports() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysVisits = await prisma.libraryVisit.count({
    where: { entryTime: { gte: today } }
  });
  
  const completedVisits = await prisma.libraryVisit.findMany({
    where: { exitTime: { not: null } },
    select: { durationMinutes: true }
  });

  const totalMinutes = completedVisits.reduce((acc, visit) => acc + (visit.durationMinutes || 0), 0);
  const avgMinutes = completedVisits.length > 0 ? Math.floor(totalMinutes / completedVisits.length) : 0;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
           <FileText className="w-8 h-8 mr-3 text-blue-600" /> Reports & Analytics
        </h1>
        <Button className="bg-slate-900 hover:bg-slate-800">
           <Download className="w-4 h-4 mr-2" /> Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-slate-500">Total Visits Recorded</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-3xl font-bold text-slate-900">{todaysVisits}</p>
               <p className="text-xs text-slate-500 mt-1">Today</p>
            </CardContent>
         </Card>
         
         <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-slate-500">Average Visit Duration</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-3xl font-bold text-slate-900">{avgMinutes} mins</p>
               <p className="text-xs text-slate-500 mt-1">Overall</p>
            </CardContent>
         </Card>
         
         <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-slate-500">Total Library Hours</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-3xl font-bold text-slate-900">{Math.floor(totalMinutes / 60)} hrs</p>
               <p className="text-xs text-slate-500 mt-1">Overall</p>
            </CardContent>
         </Card>
      </div>
      
      <Card className="shadow-sm border-slate-200 p-8 text-center bg-slate-50">
         <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
         <h3 className="text-lg font-medium text-slate-700">Detailed reporting coming soon</h3>
         <p className="text-slate-500 max-w-md mx-auto mt-2">
            The full reporting module with date filters, department breakdowns, and PDF exports is currently under development.
         </p>
      </Card>
    </div>
  );
}
