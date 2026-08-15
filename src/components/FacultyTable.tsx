"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Trash2, Loader2 } from "lucide-react";
import UserFormModal from "@/components/UserFormModal";
import DeleteUserButton from "@/components/DeleteUserButton";
import { deleteUsers } from "@/actions/users";
import { toast } from "sonner";

interface FacultyTableProps {
  initialFaculty: any[];
}

export default function FacultyTable({ initialFaculty }: FacultyTableProps) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, startBulkDeleteTransition] = useTransition();

  const filteredFaculty = useMemo(() => {
    return initialFaculty.filter((faculty) => {
      const matchesSearch = 
        faculty.name.toLowerCase().includes(search.toLowerCase()) ||
        faculty.identifier.toLowerCase().includes(search.toLowerCase());
      
      const matchesDept = deptFilter === "ALL" || faculty.department === deptFilter;

      return matchesSearch && matchesDept;
    });
  }, [initialFaculty, search, deptFilter]);

  const hasActiveFilters = search !== "" || deptFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setDeptFilter("ALL");
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFaculty.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFaculty.map(f => f.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected faculty members?`);
    if (!confirmDelete) return;

    startBulkDeleteTransition(async () => {
      const res = await deleteUsers(selectedIds, "FACULTY");
      if (res.success) {
        toast.success("Success", { description: res.message });
        setSelectedIds([]);
      } else {
        toast.error("Error", { description: res.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 grid gap-1.5 w-full">
          <label htmlFor="faculty-search" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="faculty-search"
              placeholder="Search by name or faculty ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIds([]);
              }}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:bg-white dark:bg-slate-950 dark:border-white/10 dark:text-white dark:focus-visible:bg-slate-950"
            />
          </div>
        </div>

        {/* Department Filter */}
        <div className="grid gap-1.5 w-full sm:w-64">
          <label htmlFor="faculty-dept" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</label>
          <select
            id="faculty-dept"
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setSelectedIds([]);
            }}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 focus-visible:bg-white text-slate-700 dark:bg-slate-950 dark:border-white/10 dark:text-slate-300 dark:focus-visible:bg-slate-950 dark:focus-visible:ring-white/30"
          >
            <option value="ALL">All Departments</option>
            <option value="IT">IT</option>
            <option value="ADS">ADS</option>
          </select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-9 px-3 text-slate-500 hover:text-slate-900 border border-dashed border-slate-200 dark:border-white/10 dark:text-slate-400 dark:hover:text-white font-medium"
          >
            <X className="w-4 h-4 mr-1.5" /> Clear
          </Button>
        )}
      </div>

      {/* Faculty List Card */}
      <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/25 border-b border-slate-100 dark:border-white/5 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg text-slate-700 dark:text-slate-250">
            {selectedIds.length > 0 ? (
              <span className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                {selectedIds.length} Selected
              </span>
            ) : (
              `Registered Faculty (${filteredFaculty.length} of ${initialFaculty.length})`
            )}
          </CardTitle>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isDeletingBulk ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Selected
              </Button>
            )}
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-slate-900/50 border-b dark:border-white/5">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={filteredFaculty.length > 0 && selectedIds.length === filteredFaculty.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 accent-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Faculty ID</th>
                <th className="px-3 py-3">Barcode</th>
                <th className="px-3 py-3">Department</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Designation</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredFaculty.map((faculty) => (
                <tr key={faculty.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-3 py-3 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(faculty.id)}
                      onChange={() => toggleSelectOne(faculty.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 accent-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3 font-bold text-slate-900 dark:text-white text-xs">{faculty.name}</td>
                  <td className="px-3 py-3 font-mono text-slate-600 dark:text-slate-400 text-xs">{faculty.identifier}</td>
                  <td className="px-3 py-3 font-mono text-slate-600 dark:text-slate-400 text-xs">{faculty.barcode || faculty.identifier}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400 text-xs">{faculty.department}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400 text-xs">{faculty.email || "-"}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400 text-xs">{faculty.designation}</td>
                  <td className="px-3 py-3 text-right flex justify-end gap-0.5 items-center">
                    <UserFormModal type="FACULTY" mode="EDIT" initialData={faculty} />
                    <DeleteUserButton id={faculty.id} name={faculty.name} role="FACULTY" />
                  </td>
                </tr>
              ))}
              {filteredFaculty.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                    No faculty members found matching the filters.
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
