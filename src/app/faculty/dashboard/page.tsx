import { getFacultyDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Book, Clock, LogOut, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Faculty Dashboard - Sona IT Library",
};

export default async function FacultyDashboard() {
  const data = await getFacultyDashboardData();
  const { user, stats, currentVisit } = data;

  const formatDuration = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-500">
      <header className="bg-slate-900 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="transition-all duration-300 hover:scale-105 active:scale-95 block">
              <Image src="/logo.png" alt="Sona College Logo" width={140} height={40} className="hidden sm:block object-contain bg-white/10 p-1 rounded-md cursor-pointer" />
              <Image src="/icon.jpg" alt="Sona College Logo" width={36} height={36} className="block sm:hidden object-contain bg-white p-0.5 rounded-md cursor-pointer" />
            </Link>
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <h1 className="text-xl font-bold tracking-tight">IT Library</h1>
              <p className="text-slate-400 text-xs">Faculty Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <span className="hidden sm:inline text-sm font-medium">Welcome, {user.name}</span>
            <form action="/api/auth/logout" method="POST">
               <Button type="submit" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer" size="sm">
                 <LogOut className="w-4 h-4 mr-2" /> Logout
               </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <Card className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-100">
             <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-mono mt-1">{user.identifier}</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4 text-sm font-medium">
                   <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md text-slate-700 dark:text-slate-300">{user.department}</div>
                   <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md text-slate-700 dark:text-slate-300">{user.designation}</div>
                </div>
             </CardContent>
           </Card>

            {/* Stats Cards */}
            <Card className="shadow-sm border-slate-200 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-850 dark:text-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                  <Book className="w-4 h-4 mr-2 text-blue-500" /> Total Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalVisits}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-850 dark:text-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Avg Session Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgDurationMinutes} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">mins</span></p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-850 dark:text-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-orange-400" /> Total Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatDuration(stats.totalMinutes)}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-850 dark:text-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-emerald-500" /> Weekly Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="flex gap-1.5 justify-between">
                  {["M", "T", "W", "Th", "F"].map((dayName, idx) => {
                    const attended = stats.uniqueDays.includes(idx);
                    return (
                      <div key={dayName} className="flex flex-col items-center gap-1.5 flex-1">
                        <span className="text-[9px] text-slate-400 font-bold">{dayName}</span>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                          attended 
                            ? "bg-emerald-500 text-white shadow-xs shadow-emerald-500/10" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>
                          {attended ? "✓" : "•"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className={`col-span-1 md:col-span-4 shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 ${currentVisit ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-500/20' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                 {currentVisit ? (
                   <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <div>
                         <p className="text-lg font-bold text-blue-900 dark:text-blue-400">Currently Inside</p>
                         <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Entered at {format(new Date(currentVisit.entryTime), "hh:mm a")}
                         </p>
                      </div>
                   </div>
                 ) : (
                   <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                      <div>
                         <p className="text-lg font-bold text-slate-700 dark:text-slate-400">Not Inside</p>
                      </div>
                   </div>
                 )}
              </CardContent>
            </Card>
         </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Visit History</h3>
        <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b dark:border-white/5">
                   <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Entry Time</th>
                      <th className="px-6 py-4">Exit Time</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                   {user.visits.map((visit) => (
                      <tr key={visit.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                         <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            {format(new Date(visit.entryTime), "MMM dd, yyyy")}
                         </td>
                         <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                            {format(new Date(visit.entryTime), "hh:mm a")}
                         </td>
                         <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                            {visit.exitTime ? format(new Date(visit.exitTime), "hh:mm a") : "-"}
                         </td>
                         <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                            {visit.durationMinutes ? formatDuration(visit.durationMinutes) : "-"}
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${visit.status === 'INSIDE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                               {visit.status}
                            </span>
                         </td>
                      </tr>
                   ))}
                   {user.visits.length === 0 && (
                      <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                            No visits recorded yet.
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
           </div>
        </Card>
      </main>
    </div>
  );
}
