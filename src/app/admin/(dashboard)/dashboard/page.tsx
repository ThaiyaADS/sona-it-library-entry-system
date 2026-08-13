import { getAdminDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Users, Activity, LogIn, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Admin Dashboard - Sona IT Library",
};

export default async function AdminDashboard() {
  const { stats, liveUsers } = await getAdminDashboardData();

  const formatDuration = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  const studentInsides = liveUsers.filter(v => v.user.role === 'STUDENT').length;
  const facultyInsides = liveUsers.filter(v => v.user.role === 'FACULTY').length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Library Administration</h1>
        <div className="bg-white px-4 py-2 rounded-md shadow-sm border border-slate-200 font-mono text-slate-600">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Today's Visits</CardTitle>
            <LogIn className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.todaysVisits}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-200 bg-blue-50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-700">Currently Inside</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">{stats.insideUsers}</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">{studentInsides} Students, {facultyInsides} Faculty</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Completed Today</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.completedToday}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Library Hours Today</CardTitle>
            <Clock className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{formatDuration(stats.totalMinutesToday)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Total Students</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Total Faculty</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{stats.totalFaculty}</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-500" /> Users Currently Inside Library
      </h3>
      <Card className="shadow-sm border-slate-200">
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                 <tr>
                    <th className="px-6 py-4">User Type</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">ID</th>
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
                       <td className="px-6 py-4 font-medium text-slate-900">{visit.user.name}</td>
                       <td className="px-6 py-4 font-mono text-slate-600">{visit.user.identifier}</td>
                       <td className="px-6 py-4 text-slate-600">
                          {visit.user.department}
                          <div className="text-xs text-slate-400">{visit.user.designation || visit.user.course}</div>
                       </td>
                       <td className="px-6 py-4 font-mono text-slate-600">
                          {format(new Date(visit.entryTime), "hh:mm a")}
                       </td>
                       <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center w-fit">
                             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                             INSIDE
                          </span>
                       </td>
                    </tr>
                 ))}
                 {liveUsers.length === 0 && (
                    <tr>
                       <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No users currently in the library.
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
