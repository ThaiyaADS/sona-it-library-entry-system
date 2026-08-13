"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import UserFormModal from "@/components/UserFormModal";
import DeleteUserButton from "@/components/DeleteUserButton";

interface FacultyTableProps {
  initialFaculty: any[];
}

export default function FacultyTable({ initialFaculty }: FacultyTableProps) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");

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
  };

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 grid gap-1.5 w-full">
          <label htmlFor="faculty-search" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="faculty-search"
              placeholder="Search by name or faculty ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
            />
          </div>
        </div>

        {/* Department Filter */}
        <div className="grid gap-1.5 w-full sm:w-64">
          <label htmlFor="faculty-dept" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</label>
          <select
            id="faculty-dept"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 focus-visible:bg-white text-slate-700"
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
            className="h-9 px-3 text-slate-500 hover:text-slate-900 border border-dashed border-slate-200 font-medium"
          >
            <X className="w-4 h-4 mr-1.5" /> Clear
          </Button>
        )}
      </div>

      {/* Faculty List Card */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg text-slate-700">
            Registered Faculty ({filteredFaculty.length} of {initialFaculty.length})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-white border-b">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Faculty ID</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((faculty) => (
                <tr key={faculty.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">{faculty.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{faculty.identifier}</td>
                  <td className="px-6 py-4 text-slate-600">{faculty.department}</td>
                  <td className="px-6 py-4 text-slate-600">{faculty.designation}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1 items-center">
                    <UserFormModal type="FACULTY" mode="EDIT" initialData={faculty} />
                    <DeleteUserButton id={faculty.id} name={faculty.name} role="FACULTY" />
                  </td>
                </tr>
              ))}
              {filteredFaculty.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
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
