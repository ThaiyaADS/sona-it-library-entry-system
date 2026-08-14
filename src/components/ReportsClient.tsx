"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { 
  FileText, 
  Download, 
  BookOpen, 
  Clock, 
  Users, 
  Calendar,
  Activity,
  User,
  RotateCcw,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getReportsData } from "@/actions/reports";

interface ReportsClientProps {
  initialVisits: any[];
  initialStats: {
    totalVisits: number;
    totalMinutes: number;
    avgMinutes: number;
  };
  departments: string[];
}

export default function ReportsClient({ 
  initialVisits, 
  initialStats, 
  departments 
}: ReportsClientProps) {
  const [visits, setVisits] = useState(initialVisits);
  const [stats, setStats] = useState(initialStats);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [role, setRole] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const handleApplyFilters = () => {
    startTransition(async () => {
      const res = await getReportsData({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        role: role || undefined,
        department: department || undefined
      });
      if (res.success) {
        setVisits(res.visits);
        setStats(res.stats);
      }
    });
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setRole("ALL");
    setDepartment("ALL");
    
    startTransition(async () => {
      const res = await getReportsData({});
      if (res.success) {
        setVisits(res.visits);
        setStats(res.stats);
      }
    });
  };

  const formatDuration = (totalMins: number | null) => {
    if (totalMins === null) return "-";
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  };

  const exportToCSV = () => {
    if (visits.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Header row
    const headers = [
      "Date",
      "Name",
      "Identifier/ID",
      "Role",
      "Department",
      "Details (Course/Designation)",
      "Entry Time",
      "Exit Time",
      "Duration (Minutes)",
      "Status"
    ];

    // Data rows
    const rows = visits.map(visit => {
      const date = format(new Date(visit.entryTime), "yyyy-MM-dd");
      const name = visit.user.name.replace(/"/g, '""');
      const identifier = visit.user.identifier;
      const userRole = visit.user.role;
      const dept = visit.user.department.replace(/"/g, '""');
      const details = (visit.user.designation || visit.user.course || "").replace(/"/g, '""');
      const entryTime = format(new Date(visit.entryTime), "hh:mm:ss a");
      const exitTime = visit.exitTime ? format(new Date(visit.exitTime), "hh:mm:ss a") : "-";
      const duration = visit.durationMinutes !== null ? visit.durationMinutes : "-";
      const status = visit.status;

      return [
        `"${date}"`,
        `"${name}"`,
        `"${identifier}"`,
        `"${userRole}"`,
        `"${dept}"`,
        `"${details}"`,
        `"${entryTime}"`,
        `"${exitTime}"`,
        `"${duration}"`,
        `"${status}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Library_Report_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" /> Reports & Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">Filter, analyze, and export library visit logs</p>
        </div>
        <Button 
          onClick={exportToCSV}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-2"
          disabled={visits.length === 0}
        >
          <Download className="w-4 h-4" /> Export to CSV
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="shadow-sm border-slate-200 mb-8 bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 h-10 border-slate-200 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9 h-10 border-slate-200 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Role Filter
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="FACULTY">Faculty</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                className="border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-3"
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
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Filtered Visits</CardTitle>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalVisits}</p>
            <p className="text-xs text-slate-500 mt-1">Total visits for active filters</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Avg Session Duration</CardTitle>
            <Clock className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-slate-900">{stats.avgMinutes} mins</p>
            <p className="text-xs text-slate-500 mt-1">Based on completed visits</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Accumulated Study Time</CardTitle>
            <Clock className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-slate-900">{formatDuration(stats.totalMinutes)}</p>
            <p className="text-xs text-slate-500 mt-1">Total hours spent in library</p>
          </CardContent>
        </Card>
      </div>

      {/* Visits Log Table */}
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 flex flex-row justify-between items-center bg-slate-50/50 py-4 px-6">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Filtered Logs
          </CardTitle>
          <Badge variant="secondary">{visits.length} records</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
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
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {format(new Date(visit.entryTime), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={visit.user.role === 'FACULTY' ? 'secondary' : 'default'} className="text-[10px]">
                      {visit.user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {visit.user.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{visit.user.identifier}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {format(new Date(visit.entryTime), "hh:mm a")}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {visit.exitTime ? format(new Date(visit.exitTime), "hh:mm a") : "-"}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">
                    {formatDuration(visit.durationMinutes)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      visit.status === 'INSIDE' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 bg-slate-50/10">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-base font-medium text-slate-700">No matching visits found.</p>
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
