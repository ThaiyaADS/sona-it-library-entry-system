"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Activity, Search, RefreshCw, Radio } from "lucide-react";

export default function LiveMonitoringClient({ initialLiveUsers }: { initialLiveUsers: any[] }) {
  const [liveUsers, setLiveUsers] = useState<any[]>(initialLiveUsers);
  const [search, setSearch] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchLiveUsers = async () => {
      setIsPolling(true);
      try {
        const res = await fetch("/api/admin/live-users");
        if (res.ok) {
          const data = await res.json();
          if (data.liveUsers) {
            setLiveUsers(data.liveUsers);
            setLastUpdated(new Date());
          }
        }
      } catch (err) {
        console.error("Error polling live users:", err);
      } finally {
        setIsPolling(false);
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(fetchLiveUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = liveUsers.filter((visit) => {
    const term = search.toLowerCase();
    return (
      visit.user.name.toLowerCase().includes(term) ||
      visit.user.identifier.toLowerCase().includes(term) ||
      visit.user.department.toLowerCase().includes(term) ||
      visit.user.role.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Live status indicators header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Live Monitoring <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            Auto-refreshing gate tracker
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[11px] font-mono text-slate-400">
              (Last update: {format(lastUpdated, "hh:mm:ss a")})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isPolling && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
          <div className="bg-blue-50 text-blue-800 px-5 py-2 rounded-2xl shadow-xs border border-blue-200 font-bold text-sm flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 animate-ping"></span>
            <span>{liveUsers.length} Users Inside</span>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search currently inside by name, ID, dept..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10.5 border-slate-200 rounded-xl focus:ring-blue-500/10 focus:border-blue-500 bg-white"
        />
      </div>

      {/* Main logs display card */}
      <Card className="shadow-xs border-slate-200 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6">
          <CardTitle className="text-base flex items-center text-slate-700 font-bold">
            <Activity className="w-4 h-4 mr-2 text-blue-500" /> Currently Inside Library ({filteredUsers.length} shown)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/20 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">User Type</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">ID / Barcode</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Entry Time</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Badge variant={visit.user.role === 'FACULTY' ? 'secondary' : 'default'} className="text-[10px] py-0.5 px-2.5 rounded-md font-bold">
                        {visit.user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{visit.user.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{visit.user.identifier}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <span className="font-semibold">{visit.user.department}</span>
                      {(visit.user.designation || visit.user.course) && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{visit.user.designation || visit.user.course}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700 text-xs">
                      {format(new Date(visit.entryTime), "hh:mm:ss a")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                        INSIDE
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500 bg-white">
                      <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-base font-bold text-slate-700">No matching logs</p>
                      <p className="text-sm text-slate-400 mt-1">No active members found matching your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
