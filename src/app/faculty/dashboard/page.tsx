import { getFacultyDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Book, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Sona College Logo" width={140} height={40} className="object-contain bg-white/10 p-1 rounded-md" />
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <h1 className="text-xl font-bold tracking-tight">IT Library</h1>
              <p className="text-slate-400 text-xs">Faculty Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Welcome, {user.name}</span>
            <form action="/api/auth/logout" method="POST">
               <Button type="submit" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" size="sm">
                 <LogOut className="w-4 h-4 mr-2" /> Logout
               </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <Card className="col-span-1 md:col-span-4 bg-white border-0 shadow-sm">
             <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                  <p className="text-slate-500 font-mono mt-1">{user.identifier}</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4 text-sm font-medium">
                   <div className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700">{user.department}</div>
                   <div className="bg-slate-100 px-3 py-1.5 rounded-md text-slate-700">{user.designation}</div>
                </div>
             </CardContent>
           </Card>

           <Card className="shadow-sm border-slate-200">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
                 <Book className="w-4 h-4 mr-2" /> Total Visits
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-3xl font-bold text-slate-900">{stats.totalVisits}</p>
             </CardContent>
           </Card>

           <Card className="shadow-sm border-slate-200">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
                 <Clock className="w-4 h-4 mr-2" /> Total Time in Library
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-3xl font-bold text-slate-900">{formatDuration(stats.totalMinutes)}</p>
             </CardContent>
           </Card>

           <Card className={`col-span-1 md:col-span-2 shadow-sm border-slate-200 ${currentVisit ? 'bg-blue-50 border-blue-200' : ''}`}>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-slate-500">Current Status</CardTitle>
             </CardHeader>
             <CardContent>
                {currentVisit ? (
                  <div className="flex items-center gap-4">
                     <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                     <div>
                        <p className="text-lg font-bold text-blue-900">Currently Inside</p>
                        <p className="text-sm text-blue-700 mt-1">
                           Entered at {format(new Date(currentVisit.entryTime), "hh:mm a")}
                        </p>
                     </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                     <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                     <div>
                        <p className="text-lg font-bold text-slate-700">Not Inside</p>
                     </div>
                  </div>
                )}
             </CardContent>
           </Card>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4">Visit History</h3>
        <Card className="shadow-sm border-slate-200">
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                   <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Entry Time</th>
                      <th className="px-6 py-4">Exit Time</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Status</th>
                   </tr>
                </thead>
                <tbody>
                   {user.visits.map((visit) => (
                      <tr key={visit.id} className="border-b hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-900">
                            {format(new Date(visit.entryTime), "MMM dd, yyyy")}
                         </td>
                         <td className="px-6 py-4 font-mono text-slate-600">
                            {format(new Date(visit.entryTime), "hh:mm a")}
                         </td>
                         <td className="px-6 py-4 font-mono text-slate-600">
                            {visit.exitTime ? format(new Date(visit.exitTime), "hh:mm a") : "-"}
                         </td>
                         <td className="px-6 py-4 font-mono text-slate-600">
                            {visit.durationMinutes ? formatDuration(visit.durationMinutes) : "-"}
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${visit.status === 'INSIDE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                               {visit.status}
                            </span>
                         </td>
                      </tr>
                   ))}
                   {user.visits.length === 0 && (
                      <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
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
