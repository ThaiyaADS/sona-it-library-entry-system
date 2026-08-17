"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Calendar, 
  Clock, 
  BookOpen, 
  Activity, 
  User, 
  FileText, 
  RotateCcw,
  Loader2
} from "lucide-react";

interface ReportsClientProps {
  initialVisits: any[];
  initialStats?: any;
  departments: string[];
}

export default function ReportsClient({ initialVisits, initialStats, departments }: ReportsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isPending, startTransition] = useTransition();

  // Load initial filter states from URL searchParams
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [role, setRole] = useState(searchParams.get("role") || "ALL");
  const [department, setDepartment] = useState(searchParams.get("department") || "ALL");

  const visits = initialVisits;

  // Calculate statistics
  const stats = {
    totalVisits: visits.length,
    totalMinutes: visits.reduce((acc, visit) => acc + (visit.durationMinutes || 0), 0),
    avgMinutes: visits.length > 0 
      ? Math.round(visits.reduce((acc, visit) => acc + (visit.durationMinutes || 0), 0) / visits.filter(v => v.durationMinutes).length || 0)
      : 0
  };

  const formatDuration = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  const handleApplyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (startDate) params.set("startDate", startDate);
      else params.delete("startDate");
      
      if (endDate) params.set("endDate", endDate);
      else params.delete("endDate");
      
      if (role && role !== "ALL") params.set("role", role);
      else params.delete("role");
      
      if (department && department !== "ALL") params.set("department", department);
      else params.delete("department");

      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setRole("ALL");
    setDepartment("ALL");
    
    startTransition(() => {
      router.push(pathname);
    });
  };

  const exportToCSV = () => {
    if (visits.length === 0) return;

    // Headers
    const headers = ["Date", "User Role", "Name", "ID", "Department", "Entry Time", "Exit Time", "Duration (mins)", "Status"];
    
    // Rows
    const rows = visits.map((visit) => [
      format(new Date(visit.entryTime), "yyyy-MM-dd"),
      visit.user.role,
      visit.user.name,
      `="${visit.user.identifier}"`, // force string type in excel
      visit.user.department,
      format(new Date(visit.entryTime), "hh:mm a"),
      visit.exitTime ? format(new Date(visit.exitTime), "hh:mm a") : "-",
      visit.durationMinutes || 0,
      visit.status
    ]);

    // CSV format
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    // Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `library_report_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Library Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Filter, analyze, and export library visit logs</p>
        </div>
        <Button 
          onClick={exportToCSV}
          className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold flex items-center gap-2 border dark:border-white/10"
          disabled={visits.length === 0}
        >
          <Download className="w-4 h-4" /> Export to CSV
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="shadow-sm border-slate-200 mb-8 bg-white dark:bg-slate-900/60 dark:border-white/10 text-slate-800 dark:text-slate-100">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 h-10 border-slate-200 dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9 h-10 border-slate-200 dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Role Filter
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-slate-300"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="FACULTY">Faculty</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-slate-300"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 w-full">
              <Button 
                onClick={handleApplyFilters} 
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium h-10"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </Button>
              <Button 
                onClick={handleResetFilters} 
                variant="outline" 
                className="border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-white text-slate-700 h-10 px-3"
                disabled={isPending}
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Filtered Visits</CardTitle>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalVisits}</p>
            <p className="text-xs text-slate-500 mt-1">Total visits for active filters</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Session Duration</CardTitle>
            <Clock className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.avgMinutes} mins</p>
            <p className="text-xs text-slate-500 mt-1">Based on completed visits</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Accumulated Study Time</CardTitle>
            <Clock className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{formatDuration(stats.totalMinutes)}</p>
            <p className="text-xs text-slate-500 mt-1">Total hours spent in library</p>
          </CardContent>
        </Card>
      </div>

      {/* Visits Log Table */}
      <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 flex flex-row justify-between items-center bg-slate-50/50 dark:bg-slate-900/25 py-4 px-6">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Filtered Logs
          </CardTitle>
          <Badge variant="secondary">{visits.length} records</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5">
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
                <tr key={visit.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {format(new Date(visit.entryTime), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={visit.user.role === 'FACULTY' ? 'secondary' : 'default'} className="text-[10px]">
                      {visit.user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {visit.user.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{visit.user.identifier}</td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                    {format(new Date(visit.entryTime), "hh:mm a")}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                    {visit.exitTime ? format(new Date(visit.exitTime), "hh:mm a") : "-"}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-300">
                    {formatDuration(visit.durationMinutes)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      visit.status === 'INSIDE' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500/20' 
                        : 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-white/5'
                    }`}>
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/10">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">No matching visits found.</p>
                    <p className="text-sm text-slate-400">Try adjusting your filters above.</p>
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
