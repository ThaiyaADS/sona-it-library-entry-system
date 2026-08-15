"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Trash2, Loader2 } from "lucide-react";
import AdminFormModal from "@/components/AdminFormModal";
import DeleteAdminButton from "@/components/DeleteAdminButton";
import { deleteAdmins } from "@/actions/admins";
import { toast } from "sonner";

interface AdminTableProps {
  initialAdmins: any[];
}

export default function AdminTable({ initialAdmins }: AdminTableProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, startBulkDeleteTransition] = useTransition();

  const filteredAdmins = useMemo(() => {
    return initialAdmins.filter((admin) => {
      const matchesSearch = 
        admin.username.toLowerCase().includes(search.toLowerCase()) ||
        (admin.email && admin.email.toLowerCase().includes(search.toLowerCase()));

      return matchesSearch;
    });
  }, [initialAdmins, search]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAdmins.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAdmins.map(a => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected admin accounts?`);
    if (!confirmDelete) return;

    startBulkDeleteTransition(async () => {
      const res = await deleteAdmins(selectedIds);
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
      {/* Search Input Filter */}
      <div className="bg-white dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-5 items-center">
        <div className="w-full md:flex-1 grid gap-1.5">
          <label htmlFor="search-input" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search Admins</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              id="search-input"
              placeholder="Search by username or email address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIds([]);
              }}
              className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:bg-white dark:bg-slate-950 dark:border-white/10 dark:text-white dark:focus-visible:bg-slate-950 rounded-2xl"
            />
          </div>
        </div>

        {search && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setSelectedIds([]);
            }}
            className="h-11 px-4 text-slate-500 hover:text-slate-900 border border-dashed border-slate-200 dark:border-white/10 dark:text-slate-400 dark:hover:text-white rounded-2xl font-bold text-xs self-end mt-4 md:mt-0 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 mr-1.5" /> Clear Search
          </Button>
        )}
      </div>

      {/* Admin Table Display Card */}
      <Card className="shadow-sm border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in duration-300 rounded-3xl">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/25 border-b border-slate-100 dark:border-white/5 flex flex-row items-center justify-between py-4 px-6">
          <CardTitle className="text-lg text-slate-700 dark:text-slate-250 font-bold">
            {selectedIds.length > 0 ? (
              <span className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {selectedIds.length} Selected
              </span>
            ) : (
              `Registered Admins (${filteredAdmins.length})`
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
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-slate-900/50 border-b dark:border-white/5">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={filteredAdmins.length > 0 && selectedIds.length === filteredAdmins.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 accent-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(admin.id)}
                      onChange={() => toggleSelectOne(admin.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 accent-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">{admin.username}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{admin.email || "-"}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1 items-center">
                    <AdminFormModal mode="EDIT" initialData={admin} />
                    <DeleteAdminButton id={admin.id} username={admin.username} />
                  </td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No admin accounts found matching the search query.
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
