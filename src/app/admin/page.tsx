import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, ShieldAlert, ArrowRight, UserCog, MonitorPlay } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Admin & Operations Portal - Sona IT Library",
  description: "Administrative tools for Sona College IT Library including entry scanners and reporting.",
};

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between transition-colors duration-500">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="transition-all duration-300 hover:scale-105 active:scale-95 block">
              <Image 
                src="/logo.png" 
                alt="Sona College Logo" 
                width={160} 
                height={50} 
                className="object-contain bg-white/95 p-1.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer" 
              />
            </Link>
            <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-3">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">IT Library</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Operations Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/">
              <Button variant="outline" className="border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 text-sm font-semibold transition-all">
                <span className="hidden sm:inline">Student & Faculty Portal</span>
                <span className="sm:hidden">Portal</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Actions */}
      <main className="flex-1 container mx-auto px-6 py-16 flex flex-col justify-center items-center">
        <div className="max-w-4xl w-full text-center mb-12">
          <span className="px-3.5 py-1 text-xs font-semibold tracking-wider text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-950/60 rounded-full border border-teal-200 dark:border-teal-900/50 inline-block mb-4 shadow-sm shadow-teal-100 dark:shadow-teal-950/30">
            System Operations
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Library Entry Administration
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Manage student & faculty visit records, monitor live library traffic, or launch the automated entry/exit barcode scanner.
          </p>
        </div>

        {/* Portal Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl w-full">
          {/* Card 1: Scanner */}
          <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] flex flex-col justify-between shadow-sm dark:shadow-none">
            <CardHeader className="p-8">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                <Scan className="w-6 h-6 animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Launch Entry Scanner
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-base mt-2 leading-relaxed">
                Start the automated entry and exit tracking console. Requires a barcode reader or camera input for scanner operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0">
              <Link href="/scanner" className="block w-full">
                <Button className="w-full h-12 bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center justify-center gap-2 rounded-lg shadow-lg shadow-teal-950/30 hover:shadow-teal-500/20 transition-all">
                  <MonitorPlay className="w-4 h-4" />
                  Start Scanner Console
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 2: Admin Login */}
          <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col justify-between shadow-sm dark:shadow-none">
            <CardHeader className="p-8">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-5 group-hover:scale-110 transition-transform duration-300">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                Admin Dashboard
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-base mt-2 leading-relaxed">
                Log in to the administrative portal to manage members, review historical logs, run database backups, and generate reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0">
              <Link href="/admin/login" className="block w-full">
                <Button variant="secondary" className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 transition-all">
                  <UserCog className="w-4 h-4" />
                  Admin Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-slate-100/50 dark:bg-slate-950 py-8 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-6">
          <p className="font-semibold text-slate-600 dark:text-slate-400">Sona College of Technology</p>
          <p className="text-slate-500 dark:text-slate-600 text-xs mt-1">Department of Information Technology</p>
          <div className="mt-4 flex gap-4 justify-center text-slate-500 dark:text-slate-600 text-xs font-medium">
            <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors">Student & Faculty Portal</Link>
            <span>&bull;</span>
            <Link href="/admin/login" className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors">Direct Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
