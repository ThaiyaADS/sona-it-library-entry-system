import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Briefcase, 
  Clock, 
  QrCode, 
  Activity, 
  Users, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import { getPublicLibraryStats } from "@/actions/dashboard";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Home() {
  const stats = await getPublicLibraryStats();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden transition-colors duration-500">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none hidden dark:block" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none hidden dark:block" />

      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md py-4 sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="transition-all duration-300 hover:scale-105 active:scale-95 block">
              <Image 
                src="/logo.png" 
                alt="Sona College Logo" 
                width={150} 
                height={45} 
                className="hidden sm:block object-contain bg-white/95 p-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer" 
                priority
              />
              <Image 
                src="/icon.jpg" 
                alt="Sona College Logo" 
                width={36} 
                height={36} 
                className="block sm:hidden object-contain bg-white/95 p-1 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer" 
                priority
              />
            </Link>
            <div className="hidden sm:block border-l border-slate-200 dark:border-white/10 pl-3">
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tight leading-none">
                IT Library Portal
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] tracking-wider uppercase mt-1">Department of IT</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/admin">
              <Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold transition-all duration-300">
                <span className="hidden sm:inline">Admin Console</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            </Link>
            <Link href="/scanner">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20 flex items-center gap-1.5 transition-all duration-300 cursor-pointer">
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Scan Gate</span>
                <span className="sm:hidden">Scan</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12 md:py-20 flex flex-col justify-center items-center relative z-10">
        
        {/* Hero Section */}
        <div className="max-w-3xl text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20 rounded-full mb-6">
            <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400 animate-pulse" />
            <span>Sona College of Technology</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 dark:from-white dark:via-slate-100 dark:to-slate-400">
            Smart Library Entry System
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A digital gateway for Department of IT members. Sign in to view your visit history, log durations, and profile records.
          </p>
        </div>

        {/* Live Stats Dashboard */}
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

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          
          {/* Student Card */}
          <div className="relative group rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 bg-white dark:bg-slate-900/30 backdrop-blur-md flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            
            <div className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-all duration-300 shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Student Portal</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Log in using your Admission Number to view your dashboard, log history, accumulated study hours, and check-in details.
              </p>
            </div>

            <div className="px-8 pb-8 pt-0">
              <Link href="/student/login" className="block w-full">
                <Button className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-300 group-hover:translate-y-[-2px] shadow-lg shadow-black/5 dark:shadow-white/5 cursor-pointer">
                  Student Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Faculty Card */}
          <div className="relative group rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 bg-white dark:bg-slate-900/30 backdrop-blur-md flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
            
            <div className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-all duration-300 shadow-inner">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Faculty Portal</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Log in using your Faculty ID or registered email to monitor your logs, entry durations, and check active records.
              </p>
            </div>

            <div className="px-8 pb-8 pt-0">
              <Link href="/faculty/login" className="block w-full">
                <Button variant="outline" className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:hover:border-amber-400/30 dark:text-slate-200 dark:hover:text-amber-400 dark:hover:bg-amber-400/5 font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-300 group-hover:translate-y-[-2px] cursor-pointer">
                  Faculty Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

        </div>

        {/* Operating Hours Info */}
        <div className="mt-12 text-slate-600 dark:text-slate-500 text-xs flex items-center gap-2 bg-slate-200/50 dark:bg-slate-900/20 px-4 py-2 border border-slate-300/50 dark:border-white/5 rounded-full animate-in fade-in duration-1000 delay-300">
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Library Timings: <strong>8:00 AM - 8:00 PM</strong></span>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/80 py-8 text-center text-slate-500 mt-auto relative z-10 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Sona College of Technology</p>
          <p className="text-slate-500 text-xs mt-1">Salem, Tamil Nadu, India | Department of Information Technology</p>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 sm:gap-6 justify-center text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Link href="/student/login" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Student Log</Link>
            <span className="hidden sm:inline">&bull;</span>
            <Link href="/faculty/login" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Faculty Log</Link>
            <span className="hidden sm:inline">&bull;</span>
            <Link href="/admin" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-semibold text-slate-600 dark:text-slate-300">Admin Portal</Link>
            <span className="hidden sm:inline">&bull;</span>
            <Link href="/scanner" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-semibold text-slate-600 dark:text-slate-300">Scanner Gate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
