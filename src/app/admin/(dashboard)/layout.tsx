import Link from "next/link";
import { Users, BookOpen, Clock, Activity, LogOut, FileText, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen">
        <div className="p-6 border-b border-slate-800">
          <Image src="/logo.png" alt="Sona College Logo" width={160} height={50} className="object-contain bg-white/10 p-1 rounded-md mb-4" />
          <h2 className="text-xl font-bold text-white tracking-tight">IT Library</h2>
          <p className="text-xs text-slate-400 mt-1">Administration Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/live" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Activity className="w-5 h-5" /> Live Monitoring
          </Link>
          <Link href="/admin/students" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> Students
          </Link>
          <Link href="/admin/faculty" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> Faculty
          </Link>
          <Link href="/admin/visits" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" /> Library Visits
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <FileText className="w-5 h-5" /> Reports
          </Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800 flex flex-col gap-3">
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
