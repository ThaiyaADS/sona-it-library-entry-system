"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, BookOpen, Clock, Activity, LogOut, FileText, Settings, LayoutDashboard, UserCheck, Menu, X, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import { getSessionUser } from "@/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [adminName, setAdminName] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getSessionUser();
        if (user?.name) {
          setAdminName(user.name);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-500">
      
      {/* Backdrop overlay for mobile drawer menu */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar - Persistent on desktop, slide-in drawer on mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col h-screen transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        md:translate-x-0 md:static md:h-auto md:min-h-screen md:flex shrink-0
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between md:block">
          <div>
            <Link href="/" onClick={() => setIsOpen(false)} className="transition-all duration-300 hover:scale-105 active:scale-95 block w-fit mb-4">
              <Image src="/logo.png" alt="Sona College Logo" width={160} height={50} className="object-contain bg-white/10 p-1 rounded-md cursor-pointer" />
            </Link>
            <h2 className="text-xl font-bold text-white tracking-tight">IT Library</h2>
            <p className="text-xs text-slate-400 mt-1">Administration Portal</p>
          </div>
          
          {/* Close button inside sidebar for accessibility (mobile only) */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
          <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/scanner" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Scan className="w-5 h-5" /> Barcode Scanner
          </Link>
          <Link href="/admin/live" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Activity className="w-5 h-5" /> Live Monitoring
          </Link>
          <Link href="/admin/students" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> Students
          </Link>
          <Link href="/admin/faculty" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> Faculty
          </Link>
          <Link href="/admin/admins" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <UserCheck className="w-5 h-5" /> Admin Accounts
          </Link>
          <Link href="/admin/visits" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" /> Library Visits
          </Link>
          <Link href="/admin/reports" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <FileText className="w-5 h-5" /> Reports
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Global Top Header Bar with action buttons */}
        <header className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-colors duration-500">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer h-9 w-9 rounded-lg"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sona IT Library Admin Console</span>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Admin Portal</span>
            </div>
          </div>

          {/* Action buttons on the right corner */}
          <div className="flex items-center gap-4">
            {adminName && (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 px-3.5 py-1.5 rounded-full border border-slate-200/50 dark:border-white/5 animate-in fade-in slide-in-from-right duration-300">
                Welcome, <span className="text-blue-600 dark:text-blue-400 font-extrabold">{adminName}</span>
              </span>
            )}
            <ThemeToggle />
            <form action="/api/auth/logout" method="POST" className="flex items-center">
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 rounded-xl cursor-pointer h-9.5 w-9.5"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
