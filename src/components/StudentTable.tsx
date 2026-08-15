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

interface StudentTableProps {
  initialStudents: any[];
}

export default function StudentTable({ initialStudents }: StudentTableProps) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, startBulkDeleteTransition] = useTransition();

  const filteredStudents = useMemo(() => {
    return initialStudents.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.identifier.toLowerCase().includes(search.toLowerCase()) ||
        (student.registerNumber && student.registerNumber.toLowerCase().includes(search.toLowerCase()));
      
      const matchesDept = deptFilter === "ALL" || student.department === deptFilter;
      const matchesYear = yearFilter === "ALL" || student.year === yearFilter;
      const matchesSection = sectionFilter === "ALL" || student.section === sectionFilter;

      return matchesSearch && matchesDept && matchesYear && matchesSection;
    });
  }, [initialStudents, search, deptFilter, yearFilter, sectionFilter]);

  const hasActiveFilters = search !== "" || deptFilter !== "ALL" || yearFilter !== "ALL" || sectionFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setDeptFilter("ALL");
    setYearFilter("ALL");
    setSectionFilter("ALL");
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected students?`);
    if (!confirmDelete) return;

    startBulkDeleteTransition(async () => {
      const res = await deleteUsers(selectedIds, "STUDENT");
      if (res.success) {
        toast.success("Success", { description: res.message });
        setSelectedIds([]);
      } else {
        toast.error("Error", { description: res.message });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search & Department Selector */}
      <div className="bg-white dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-5 items-center">
        {/* Search */}
        <div className="w-full md:flex-1 grid gap-1.5">
          <label htmlFor="search-input" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search Students</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              id="search-input"
              placeholder="Search by name, admission or register number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIds([]);
              }}
              className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:bg-white dark:bg-slate-950 dark:border-white/10 dark:text-white dark:focus-visible:bg-slate-950 rounded-2xl"
            />
          </div>
        </div>

        {/* Department Filter */}
        <div className="w-full md:w-72 grid gap-1.5">
          <label htmlFor="dept-select" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</label>
          <select
            id="dept-select"
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setSelectedIds([]);
            }}
            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 focus-visible:bg-white text-slate-700 dark:bg-slate-950 dark:border-white/10 dark:text-slate-300 dark:focus-visible:bg-slate-950 dark:focus-visible:ring-white/30 cursor-pointer"
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
            className="h-11 px-4 text-slate-500 hover:text-slate-900 border border-dashed border-slate-200 dark:border-white/10 dark:text-slate-400 dark:hover:text-white rounded-2xl font-bold text-xs self-end mt-4 md:mt-0 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 mr-1.5" /> Clear Filters
          </Button>
        )}
      </div>

      {/* Students List Card */}
      <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in duration-300 rounded-3xl">
        
        {/* Card Header with Title and Year Tabs */}
        <CardHeader className="bg-slate-50 dark:bg-slate-900/25 border-b border-slate-100 dark:border-white/5 flex flex-col lg:flex-row items-start lg:items-center justify-between py-4 px-6 gap-4">
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <CardTitle className="text-lg text-slate-700 dark:text-slate-250 font-bold">
              {selectedIds.length > 0 ? (
                <span className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {selectedIds.length} Selected
                </span>
              ) : (
                `Registered Students (${filteredStudents.length})`
              )}
            </CardTitle>
            
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="h-8 px-3 text-[11px] font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isDeletingBulk ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Selected
              </Button>
            )}
          </div>

          {/* Year segment tabs in card header */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl self-stretch lg:self-auto overflow-x-auto">
            {[
              { id: "ALL", label: "All Years" },
              { id: "I", label: "I Year" },
              { id: "II", label: "II Year" },
              { id: "III", label: "III Year" },
              { id: "IV", label: "IV Year" },
            ].map((y) => {
              const active = yearFilter === y.id;
              return (
                <button
                  key={y.id}
                  onClick={() => {
                    setYearFilter(y.id);
                    setSelectedIds([]);
                  }}
                  className={`h-8 px-4 rounded-lg font-bold text-xs transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {y.label}
                </button>
              );
            })}
          </div>
        </CardHeader>

        {/* Section segment tabs inside card */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-950/10 flex items-center gap-4 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Sections:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: "ALL", label: "All Sections" },
              { id: "A", label: "Section A" },
              { id: "B", label: "Section B" },
              { id: "C", label: "Section C" },
            ].map((s) => {
              const active = sectionFilter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSectionFilter(s.id);
                    setSelectedIds([]);
                  }}
                  className={`h-7 px-3.5 rounded-lg font-semibold text-xs transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
                      : "border border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-slate-900/50 border-b dark:border-white/5">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 accent-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Admission Number</th>
                <th className="px-3 py-3">Register Number</th>
                <th className="px-3 py-3">Department</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3 text-center">Year</th>
                <th className="px-3 py-3 text-center">Section</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-3 py-3 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(student.id)}
                      onChange={() => toggleSelectOne(student.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 accent-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3 font-bold text-slate-900 dark:text-white text-xs">{student.name}</td>
                  <td className="px-3 py-3 font-mono text-slate-600 dark:text-slate-400 text-xs">{student.identifier}</td>
                  <td className="px-3 py-3 font-mono text-slate-600 dark:text-slate-400 text-xs">{student.registerNumber || "-"}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400 text-xs">{student.department}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400 text-xs">{student.email || "-"}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400 text-xs text-center">{student.year}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400 text-xs text-center">{student.section || "A"}</td>
                  <td className="px-3 py-3 text-right flex justify-end gap-0.5 items-center">
                    <UserFormModal type="STUDENT" mode="EDIT" initialData={student} />
                    <DeleteUserButton id={student.id} name={student.name} role="STUDENT" />
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                    No students found matching the filters.
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
