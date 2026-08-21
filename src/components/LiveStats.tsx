"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { getPublicLibraryStats } from "@/actions/dashboard";

interface LiveStatsProps {
  initialStats: {
    activeOccupants: number;
    todaysVisits: number;
  };
}

export default function LiveStats({ initialStats }: LiveStatsProps) {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    let active = true;
    const interval = setInterval(async () => {
      try {
        const latestStats = await getPublicLibraryStats();
        if (active) {
          setStats(latestStats);
        }
      } catch (error) {
        console.error("Failed to fetch live stats:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
      <div className="relative group overflow-hidden bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 shadow-sm dark:shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-sm font-medium">Inside Library</span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-4">{stats.activeOccupants}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Current Active Occupants</p>
      </div>

      <div className="relative group overflow-hidden bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 shadow-sm dark:shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300" />
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-sm font-medium">Today&apos;s Visits</span>
          <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        </div>
        <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-4">{stats.todaysVisits}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total visits registered today</p>
      </div>
    </div>
  );
}
