"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, BookOpen, Clock, Activity, LogOut, FileText, Settings, LayoutDashboard, UserCheck, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-500">
      
      {/* Mobile Top Navbar Header (visible only on mobile/tablet) */}
      <header className="md:hidden bg-slate-900 text-slate-100 flex items-center justify-between px-5 py-3.5 border-b border-slate-800 z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="transition-all duration-300 hover:scale-105 active:scale-95 block w-fit">
            <Image src="/icon.jpg" alt="Sona College Logo" width={34} height={34} className="object-contain bg-white p-0.5 rounded-md cursor-pointer" />
          </Link>
          <div className="border-l border-slate-800 pl-3">
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">IT Library</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Admin Portal</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer h-9 w-9 rounded-lg"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

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

        <div className="p-4 mt-auto border-t border-slate-800 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-semibold text-slate-400">Toggle Theme</span>
            <ThemeToggle />
          </div>
          <form action="/api/auth/logout" method="POST">
             <Button type="submit" variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer">
               <LogOut className="w-5 h-5 mr-3" /> Logout
             </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
