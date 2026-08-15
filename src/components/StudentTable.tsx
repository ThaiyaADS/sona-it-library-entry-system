"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import UserFormModal from "@/components/UserFormModal";
import DeleteUserButton from "@/components/DeleteUserButton";

interface StudentTableProps {
  initialStudents: any[];
}

export default function StudentTable({ initialStudents }: StudentTableProps) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");

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
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls Panel */}
      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
          {/* Search */}
          <div className="grid gap-1.5 col-span-1 sm:col-span-2">
            <label htmlFor="search-input" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="search-input"
                placeholder="Search by name, admission or register number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus-visible:bg-white dark:bg-slate-950 dark:border-white/10 dark:text-white dark:focus-visible:bg-slate-950"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="grid gap-1.5">
            <label htmlFor="dept-select" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</label>
            <select
              id="dept-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 focus-visible:bg-white text-slate-700 dark:bg-slate-950 dark:border-white/10 dark:text-slate-300 dark:focus-visible:bg-slate-950 dark:focus-visible:ring-white/30"
            >
              <option value="ALL">All Departments</option>
              <option value="IT">IT</option>
              <option value="ADS">ADS</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="grid gap-1.5">
            <label htmlFor="year-select" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Year</label>
            <select
              id="year-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 focus-visible:bg-white text-slate-700 dark:bg-slate-950 dark:border-white/10 dark:text-slate-300 dark:focus-visible:bg-slate-950 dark:focus-visible:ring-white/30"
            >
              <option value="ALL">All Years</option>
              <option value="I">I Year</option>
              <option value="II">II Year</option>
              <option value="III">III Year</option>
              <option value="IV">IV Year</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          {/* Section Filter */}
          <div className="grid gap-1.5 flex-1 md:w-32">
            <label htmlFor="section-select" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section</label>
            <select
              id="section-select"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 focus-visible:bg-white text-slate-700 dark:bg-slate-950 dark:border-white/10 dark:text-slate-300 dark:focus-visible:bg-slate-950 dark:focus-visible:ring-white/30"
            >
              <option value="ALL">All Sections</option>
              <option value="A">A Section</option>
              <option value="B">B Section</option>
              <option value="C">C Section</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-9 px-3 text-slate-500 hover:text-slate-900 border border-dashed border-slate-200 dark:border-white/10 dark:text-slate-400 dark:hover:text-white self-end font-medium"
            >
              <X className="w-4 h-4 mr-1.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Students List Card */}
      <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden text-slate-800 dark:text-slate-100">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/25 border-b border-slate-100 dark:border-white/5 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg text-slate-700 dark:text-slate-250">
            Registered Students ({filteredStudents.length} of {initialStudents.length})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-slate-900/50 border-b dark:border-white/5">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Admission Number</th>
                <th className="px-6 py-4">Register Number</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Year & Section</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{student.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{student.identifier}</td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{student.registerNumber || "-"}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{student.department}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    Year {student.year} - {student.section || "A"}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1 items-center">
                    <UserFormModal type="STUDENT" mode="EDIT" initialData={student} />
                    <DeleteUserButton id={student.id} name={student.name} role="STUDENT" />
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
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
