"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Trash2, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import UserFormModal from "@/components/UserFormModal";
import DeleteUserButton from "@/components/DeleteUserButton";
import { deleteUsers } from "@/actions/users";
import { toast } from "sonner";

interface StudentTableProps {
  initialStudents: any[];
}

interface StudentGroup {
  department: string;
  year: string;
  section: string;
  students: any[];
}

const formatYear = (year: string | null) => {
  if (!year) return "Unknown Year";
  const upperYear = year.toUpperCase();
  const numToRoman = { "1": "I", "2": "II", "3": "III", "4": "IV" };
  const roman = numToRoman[upperYear as keyof typeof numToRoman] || upperYear;
  return `Year ${roman}`;
};

const formatSection = (section: string | null) => {
  return `Section ${section || "A"}`;
};

export default function StudentTable({ initialStudents }: StudentTableProps) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupPages, setGroupPages] = useState<{ [key: string]: number }>({});
  const [pageSize, setPageSize] = useState(10);
  const [isDeletingBulk, startBulkDeleteTransition] = useTransition();

  const filteredStudents = useMemo(() => {
    return initialStudents.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.identifier.toLowerCase().includes(search.toLowerCase()) ||
        (student.registerNumber && student.registerNumber.toLowerCase().includes(search.toLowerCase())) ||
        (student.email && student.email.toLowerCase().includes(search.toLowerCase()));
      
      const matchesDept = deptFilter === "ALL" || student.department === deptFilter;
      const matchesYear = yearFilter === "ALL" || student.year === yearFilter;
      const matchesSection = sectionFilter === "ALL" || student.section === sectionFilter;

      return matchesSearch && matchesDept && matchesYear && matchesSection;
    });
  }, [initialStudents, search, deptFilter, yearFilter, sectionFilter]);

  const groupedStudents = useMemo(() => {
    const groups: { [key: string]: StudentGroup } = {};
    
    filteredStudents.forEach((student) => {
      const dept = student.department || "Unknown";
      const yr = student.year || "Unknown";
      const sec = student.section || "A";
      const key = `${dept}-${yr}-${sec}`;
      
      if (!groups[key]) {
        groups[key] = {
          department: dept,
          year: yr,
          section: sec,
          students: [],
        };
      }
      groups[key].students.push(student);
    });

    return Object.values(groups).sort((a, b) => {
      const yearOrder = { "I": 1, "II": 2, "III": 3, "IV": 4 };
      const valA = yearOrder[a.year as keyof typeof yearOrder] || 99;
      const valB = yearOrder[b.year as keyof typeof yearOrder] || 99;
      if (valA !== valB) return valA - valB;
      
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.department.localeCompare(b.department);
    });
  }, [filteredStudents]);

  const hasActiveFilters = search !== "" || deptFilter !== "ALL" || yearFilter !== "ALL" || sectionFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setDeptFilter("ALL");
    setYearFilter("ALL");
    setSectionFilter("ALL");
    setSelectedIds([]);
    setGroupPages({});
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectGroup = (groupStudents: any[]) => {
    const groupIds = groupStudents.map(s => s.id);
    const allSelected = groupIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const newSelection = [...prev];
        groupIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const isGroupAllSelected = (groupStudents: any[]) => {
    if (groupStudents.length === 0) return false;
    return groupStudents.every(s => selectedIds.includes(s.id));
  };

  const handlePageChange = (groupKey: string, newPage: number) => {
    setGroupPages(prev => ({
      ...prev,
      [groupKey]: newPage
    }));
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
      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-5 items-center">
          {/* Search */}
          <div className="w-full md:flex-1 grid gap-1.5">
            <label htmlFor="search-input" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                id="search-input"
                placeholder="Search by name, email, or registration number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIds([]);
                }}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:bg-white dark:bg-slate-950 dark:border-white/10 dark:text-white dark:focus-visible:bg-slate-950 rounded-2xl"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-11 px-4 text-slate-500 hover:text-slate-900 border border-dashed border-slate-200 dark:border-white/10 dark:text-slate-400 dark:hover:text-white rounded-2xl font-bold text-xs self-end mt-4 md:mt-0 shrink-0 cursor-pointer animate-in fade-in"
            >
              <X className="w-4 h-4 mr-1.5" /> Clear Filters
            </Button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex flex-col lg:flex-row gap-6 pt-3 border-t border-slate-100 dark:border-white/5">
          {/* Department segment tabs */}
          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Department:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: "ALL", label: "All" },
                { id: "IT", label: "IT" },
                { id: "ADS", label: "ADS" },
              ].map((d) => {
                const active = deptFilter === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDeptFilter(d.id);
                      setSelectedIds([]);
                    }}
                    className={`h-8 px-4 rounded-lg font-bold text-xs transition-all duration-200 border cursor-pointer ${
                      active
                        ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Year segment tabs */}
          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Year:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-fit overflow-x-auto">
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
          </div>

          {/* Section segment tabs */}
          <div className="shrink-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Section:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: "ALL", label: "All" },
                { id: "A", label: "A" },
                { id: "B", label: "B" },
                { id: "C", label: "C" },
              ].map((s) => {
                const active = sectionFilter === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSectionFilter(s.id);
                      setSelectedIds([]);
                    }}
                    className={`h-8 px-4 rounded-lg font-bold text-xs transition-all duration-200 border cursor-pointer ${
                      active
                        ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Global Actions bar */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
          {selectedIds.length > 0 ? (
            <span className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              {selectedIds.length} Selected
            </span>
          ) : (
            `Student Groups (${groupedStudents.length})`
          )}
        </h2>
        {selectedIds.length > 0 && (
          <Button 
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isDeletingBulk}
            className="h-10 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer animate-in slide-in-from-right duration-250"
          >
            {isDeletingBulk ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Selected
          </Button>
        )}
      </div>

      {/* Group Cards List */}
      <div className="grid gap-6">
        {groupedStudents.map((group) => {
          const groupKey = `${group.department}-${group.year}-${group.section}`;
          const currentPage = groupPages[groupKey] || 1;
          const itemsPerPage = pageSize;
          const totalStudents = group.students.length;
          const totalPages = Math.ceil(totalStudents / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const visibleStudents = group.students.slice(startIndex, startIndex + itemsPerPage);
          const isAllSelected = isGroupAllSelected(group.students);

          return (
            <Card key={groupKey} className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in duration-300 rounded-3xl p-6">
              
              {/* Group Header matching image */}
              <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {formatYear(group.year)} - {formatSection(group.section)}
                </h3>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {group.department}
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 w-10 text-center">
                        <div 
                          onClick={() => toggleSelectGroup(group.students)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-200 mx-auto ${
                            isAllSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 dark:border-white/20 bg-transparent hover:border-blue-500"
                          }`}
                        >
                          {isAllSelected && (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3.5] animate-in zoom-in duration-150" />
                          )}
                        </div>
                      </th>
                      <th className="py-3.5 px-3">Admission No</th>
                      <th className="py-3.5 px-3">Reg No</th>
                      <th className="py-3.5 px-3">Name</th>
                      <th className="py-3.5 px-3">Email</th>
                      <th className="py-3.5 px-3">Dept</th>
                      <th className="py-3.5 px-3">Year</th>
                      <th className="py-3.5 px-3">Sec</th>
                      <th className="py-3.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {visibleStudents.map((student) => {
                      const isSelected = selectedIds.includes(student.id);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 text-center">
                            <div 
                              onClick={() => toggleSelectOne(student.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-200 mx-auto ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 dark:border-white/20 bg-transparent hover:border-blue-500"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-white stroke-[3.5] animate-in zoom-in duration-150" />
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-800 dark:text-slate-100 text-xs font-semibold">
                            {student.identifier}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-800 dark:text-slate-100 text-xs font-semibold">
                            {student.registerNumber || "-"}
                          </td>
                          <td className="py-3.5 px-3 text-slate-900 dark:text-white text-xs font-bold uppercase">
                            {student.name}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 text-xs font-medium">
                            {student.email || "-"}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase">
                            {student.department}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-800 dark:text-slate-100 text-xs font-semibold">
                            {student.year}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-800 dark:text-slate-100 text-xs font-semibold">
                            {student.section}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex justify-end gap-1 items-center">
                              <UserFormModal type="STUDENT" mode="EDIT" initialData={student} />
                              <DeleteUserButton id={student.id} name={student.name} role="STUDENT" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Group Footer Pagination */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 dark:border-white/5 w-full">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalStudents)} of {totalStudents} students
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setGroupPages({});
                      }}
                      className="h-7 rounded-lg border border-slate-200 bg-white dark:bg-slate-950 dark:border-white/10 px-1.5 outline-none font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:border-blue-500 transition-colors"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="font-medium">per page</span>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(groupKey, currentPage - 1)}
                      className="h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(groupKey, currentPage + 1)}
                      className="h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {groupedStudents.length === 0 && (
          <Card className="p-8 text-center text-slate-500 border-dashed border-slate-200 dark:border-white/10 dark:text-slate-400 rounded-3xl bg-white dark:bg-slate-900/60">
            No student groups found matching the current filters.
          </Card>
        )}
      </div>
    </div>
  );
}

