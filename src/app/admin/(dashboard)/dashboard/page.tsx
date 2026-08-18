import { getAdminDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Activity, LogIn, CheckCircle, Clock, Download, LogOut, Scan } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatInIST } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard - Sona IT Library",
};

export default async function AdminDashboard() {
  const session = await getSession();
  let adminName = "Admin";
  if (session?.user?.id) {
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: { name: true, username: true }
    });
    if (admin) {
      adminName = admin.name || admin.username;
    }
  }
  const { stats, liveUsers, hourlyStats } = await getAdminDashboardData();

  const formatDuration = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  const studentInsides = liveUsers.filter(v => v.user.role === 'STUDENT').length;
  const facultyInsides = liveUsers.filter(v => v.user.role === 'FACULTY').length;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Library Administration</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sona College IT Department Entry Log Console</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Welcome, <strong className="text-slate-900 dark:text-white">{adminName}</strong>
          </span>
          {/* Quick CSV Export button */}
          <a 
            href="/api/admin/export-today" 
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all"
            title="Download today's logs as CSV spreadsheet"
          >
             <Download className="w-3.5 h-3.5" /> Export Today
          </a>
          {/* Quick Scanner launch button */}
          <Link 
            href="/admin/scanner" 
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/10 cursor-pointer transition-all"
            title="Open Barcode Scanner Gate interface"
          >
             <Scan className="w-3.5 h-3.5" /> Barcode Scanner
          </Link>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-xs font-mono text-xs text-slate-500 dark:text-slate-400">
            {formatInIST(new Date(), "weekdayDate")}
          </div>
          <form action="/api/auth/logout" method="POST">
             <button 
               type="submit" 
               className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-500/20 p-2 rounded-xl shadow-xs cursor-pointer transition-all h-[34px] w-[34px]"
               title="Logout"
             >
                <LogOut className="w-4 h-4" />
             </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-slate-200 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-800 dark:text-slate-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Today&apos;s Visits</CardTitle>
            <LogIn className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.todaysVisits}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-500/20 text-slate-800 dark:text-slate-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between bg-transparent border-0">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Currently Inside</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">{stats.insideUsers}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">{studentInsides} Students, {facultyInsides} Faculty</p>
            
            {stats.insideUsers > 0 && (
              <div className="mt-3">
                <div className="flex h-1.5 w-full rounded-full bg-blue-200/50 dark:bg-blue-950/40 overflow-hidden">
                  <div 
                    className="bg-blue-600 transition-all duration-500" 
                    style={{ width: `${Math.round((studentInsides / stats.insideUsers) * 100)}%` }} 
                    title={`${studentInsides} Students`}
                  />
                  <div 
                    className="bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${Math.round((facultyInsides / stats.insideUsers) * 100)}%` }} 
                    title={`${facultyInsides} Faculty`}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-blue-700/60 dark:text-blue-400/70 mt-1.5 font-bold font-mono">
                  <span>{Math.round((studentInsides / stats.insideUsers) * 100)}% STU</span>
                  <span>{Math.round((facultyInsides / stats.insideUsers) * 100)}% FAC</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-800 dark:text-slate-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed Today</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.completedToday}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-800 dark:text-slate-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Library Hours Today</CardTitle>
            <Clock className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatDuration(stats.totalMinutesToday)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-800 dark:text-slate-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalStudents}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-800 dark:text-slate-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Faculty</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalFaculty}</p>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours Chart */}
      <Card className="shadow-sm border-slate-200 dark:border-white/10 mb-8 overflow-hidden bg-white dark:bg-slate-900/60">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/25 border-b border-slate-100 dark:border-white/5 py-4 px-6">
          <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Peak Entry Hours (Today&apos;s Logs)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-36 items-end gap-3 pt-6 border-b border-slate-100 dark:border-white/5">
            {hourlyStats.map((item, index) => {
              const maxCount = Math.max(...hourlyStats.map((h) => h.count), 1);
              const heightPercent = Math.max(8, Math.round((item.count / maxCount) * 100));
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="mb-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {item.count}
                  </div>
                  {/* Bar */}
                  <div 
                    className={`w-full rounded-t transition-all duration-300 ${
                      item.count > 0 
                        ? "bg-gradient-to-t from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-sm" 
                        : "bg-slate-100/80 dark:bg-slate-800"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  {/* Label */}
                  <span className="text-[9px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-500" /> Users Currently Inside Library
      </h3>
      <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b dark:border-white/5">
                 <tr>
                    <th className="px-6 py-4">User Type</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Entry Time</th>
                    <th className="px-6 py-4">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                 {liveUsers.map((visit) => (
                    <tr key={visit.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                       <td className="px-6 py-4 font-medium">
                         <Badge variant={visit.user.role === 'FACULTY' ? 'secondary' : 'default'} className="text-[10px]">
                            {visit.user.role}
                         </Badge>
                       </td>
                       <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{visit.user.name}</td>
                       <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{visit.user.identifier}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {visit.user.department}
                          <div className="text-xs text-slate-400 dark:text-slate-500">{visit.user.designation || visit.user.course}</div>
                       </td>
                       <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                          {formatInIST(visit.entryTime, "time")}
                       </td>
                       <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center w-fit">
                             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                             INSIDE
                          </span>
                       </td>
                    </tr>
                 ))}
                 {liveUsers.length === 0 && (
                    <tr>
                       <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
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
