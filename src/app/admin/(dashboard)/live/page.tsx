import { getAdminDashboardData } from "@/actions/dashboard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Live Monitoring - Sona IT Library",
};

export default async function AdminLiveMonitoring() {
  const { liveUsers } = await getAdminDashboardData();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Live Monitoring</h1>
        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full shadow-sm border border-blue-200 font-bold flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
          {liveUsers.length} Users Inside
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
         <CardHeader className="bg-slate-50 border-b border-slate-100">
           <CardTitle className="text-lg flex items-center text-slate-700">
              <Activity className="w-5 h-5 mr-2 text-blue-500" /> Currently Inside Library
           </CardTitle>
         </CardHeader>
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white border-b">
                 <tr>
                    <th className="px-6 py-4">User Type</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">ID / Barcode</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Entry Time</th>
                    <th className="px-6 py-4">Status</th>
                 </tr>
              </thead>
              <tbody>
                 {liveUsers.map((visit) => (
                    <tr key={visit.id} className="border-b hover:bg-slate-50">
                       <td className="px-6 py-4 font-medium">
                         <Badge variant={visit.user.role === 'FACULTY' ? 'secondary' : 'default'} className="text-[10px]">
                            {visit.user.role}
                         </Badge>
                       </td>
                       <td className="px-6 py-4 font-bold text-slate-900">{visit.user.name}</td>
                       <td className="px-6 py-4 font-mono text-slate-600">{visit.user.identifier}</td>
                       <td className="px-6 py-4 text-slate-600">
                          {visit.user.department}
                          <div className="text-xs text-slate-400">{visit.user.designation || visit.user.course}</div>
                       </td>
                       <td className="px-6 py-4 font-mono text-slate-800">
                          {format(new Date(visit.entryTime), "hh:mm:ss a")}
                       </td>
                       <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center w-fit">
                             <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                             INSIDE
                          </span>
                       </td>
                    </tr>
                 ))}
                 {liveUsers.length === 0 && (
                    <tr>
                       <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-lg font-medium">No users currently in the library.</p>
                          <p className="text-sm">The library is empty right now.</p>
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
