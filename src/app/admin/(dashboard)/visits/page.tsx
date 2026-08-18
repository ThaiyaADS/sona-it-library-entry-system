import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { formatInIST, calculateISTDurationMinutes } from "@/lib/utils";

export const metadata = {
  title: "Library Visits - Sona IT Library",
};

export default async function AdminVisits() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const visits = await prisma.libraryVisit.findMany({
    orderBy: { entryTime: "desc" },
    take: 100, // Limit to recent 100 for simplicity in this demo
    include: {
      user: true,
    }
  });

  const formatDuration = (totalMins: number | null) => {
    if (totalMins === null) return "-";
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
           <BookOpen className="w-8 h-8 mr-3 text-blue-600" /> Library Visit History
        </h1>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden text-slate-800 dark:text-slate-100">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b dark:border-white/5">
                  <tr>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4">User Type</th>
                     <th className="px-6 py-4">Name</th>
                     <th className="px-6 py-4">ID</th>
                     <th className="px-6 py-4">Entry Time</th>
                     <th className="px-6 py-4">Exit Time</th>
                     <th className="px-6 py-4">Duration</th>
                     <th className="px-6 py-4">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {visits.map((visit) => (
                     <tr key={visit.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                           {formatInIST(visit.entryTime, "date")}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={visit.user.role === 'FACULTY' ? 'secondary' : 'default'} className="text-[10px]">
                             {visit.user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{visit.user.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{visit.user.identifier}</td>
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                           {formatInIST(visit.entryTime, "time")}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                           {visit.exitTime ? formatInIST(visit.exitTime, "time") : "-"}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-300">
                           {visit.exitTime ? formatDuration(calculateISTDurationMinutes(visit.entryTime, visit.exitTime)) : "-"}
                        </td>
                       <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${visit.status === 'INSIDE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                             {visit.status}
                          </span>
                       </td>
                    </tr>
                 ))}
                 {visits.length === 0 && (
                    <tr>
                       <td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                          No visits found.
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
