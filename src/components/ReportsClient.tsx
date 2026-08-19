"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatInIST, calculateISTDurationMinutes, formatToISTDatetimeLocal } from "@/lib/utils";
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
  Loader2,
  Edit,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateLibraryVisit, deleteLibraryVisit } from "@/actions/reports";
import { toast } from "sonner";

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

  // Edit & Delete Log states
  const [editingVisit, setEditingVisit] = useState<any | null>(null);
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);
  const [editEntryTime, setEditEntryTime] = useState("");
  const [editExitTime, setEditExitTime] = useState("");
  const [isStillInside, setIsStillInside] = useState(false);
  const [isSubmitPending, startSubmitTransition] = useTransition();

  const handleOpenEdit = (visit: any) => {
    setEditingVisit(visit);
    setEditEntryTime(formatToISTDatetimeLocal(visit.entryTime));
    setEditExitTime(visit.exitTime ? formatToISTDatetimeLocal(visit.exitTime) : "");
    setIsStillInside(!visit.exitTime);
  };

  const handleSaveEdit = () => {
    if (!editingVisit) return;
    if (!editEntryTime) {
      toast.error("Error", { description: "Entry time is required." });
      return;
    }
    if (!isStillInside && !editExitTime) {
      toast.error("Error", { description: "Exit time is required if not marked as inside." });
      return;
    }

    startSubmitTransition(async () => {
      const res = await updateLibraryVisit(
        editingVisit.id,
        editEntryTime,
        isStillInside ? null : editExitTime
      );
      if (res.success) {
        toast.success("Success", { description: res.message });
        setEditingVisit(null);
        router.refresh();
      } else {
        toast.error("Error", { description: res.message });
      }
    });
  };

  const handleDelete = () => {
    if (!deletingVisitId) return;

    startSubmitTransition(async () => {
      const res = await deleteLibraryVisit(deletingVisitId);
      if (res.success) {
        toast.success("Success", { description: res.message });
        setDeletingVisitId(null);
        router.refresh();
      } else {
        toast.error("Error", { description: res.message });
      }
    });
  };

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
      formatInIST(visit.entryTime, "isoDate"),
      visit.user.role,
      visit.user.name,
      `="${visit.user.identifier}"`, // force string type in excel
      visit.user.department,
      formatInIST(visit.entryTime, "time"),
      visit.exitTime ? formatInIST(visit.exitTime, "time") : "-",
      visit.exitTime ? calculateISTDurationMinutes(visit.entryTime, visit.exitTime) : 0,
      visit.status
    ]);

    // CSV format
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    // Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `library_report_${formatInIST(new Date(), "filenameDate")}.csv`);
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {visits.map((visit) => (
                <tr key={visit.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {formatInIST(visit.entryTime, "date")}
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
                    {formatInIST(visit.entryTime, "time")}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                    {visit.exitTime ? formatInIST(visit.exitTime, "time") : "-"}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-300">
                    {visit.exitTime ? formatDuration(calculateISTDurationMinutes(visit.entryTime, visit.exitTime)) : "-"}
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenEdit(visit)}
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Log"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeletingVisitId(visit.id)}
                        className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/10">
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

      {/* Edit Visit Dialog */}
      <Dialog open={!!editingVisit} onOpenChange={(open) => !open && setEditingVisit(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Edit Library Visit Log</DialogTitle>
          </DialogHeader>
          {editingVisit && (
            <div className="space-y-4 my-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  User
                </label>
                <div className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-150 dark:border-white/5 font-medium">
                  {editingVisit.user.name} <span className="text-xs text-slate-500 font-mono">({editingVisit.user.identifier})</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Entry Time (IST)
                </label>
                <Input
                  type="datetime-local"
                  value={editEntryTime}
                  onChange={(e) => setEditEntryTime(e.target.value)}
                  className="w-full border-slate-200 dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="stillInside"
                    checked={isStillInside}
                    onChange={(e) => setIsStillInside(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 dark:bg-slate-950"
                  />
                  <label htmlFor="stillInside" className="text-sm font-medium text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                    Currently inside the library (No checkout time)
                  </label>
                </div>

                {!isStillInside && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Exit Time (IST)
                    </label>
                    <Input
                      type="datetime-local"
                      value={editExitTime}
                      onChange={(e) => setEditExitTime(e.target.value)}
                      className="w-full border-slate-200 dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2 justify-end pt-2 border-t dark:border-white/5">
            <Button
              variant="outline"
              onClick={() => setEditingVisit(null)}
              disabled={isSubmitPending}
              className="border-slate-200 dark:border-white/10 text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitPending}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium min-w-[80px]"
            >
              {isSubmitPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingVisitId} onOpenChange={(open) => !open && setDeletingVisitId(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Delete Library Visit Log</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Are you sure you want to delete this visit log? This action is permanent and cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex gap-2 justify-end pt-2 border-t dark:border-white/5">
            <Button
              variant="outline"
              onClick={() => setDeletingVisitId(null)}
              disabled={isSubmitPending}
              className="border-slate-200 dark:border-white/10 text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSubmitPending}
              variant="destructive"
              className="bg-red-600 hover:bg-red-500 text-white font-medium min-w-[80px]"
            >
              {isSubmitPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
