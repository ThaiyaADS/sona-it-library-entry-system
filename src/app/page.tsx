import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Briefcase, BookOpen, Clock, ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Sona College Logo" 
              width={160} 
              height={50} 
              className="object-contain bg-slate-50 p-1 rounded-md" 
            />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">IT Library</h1>
              <p className="text-slate-500 text-xs">Member Portal</p>
            </div>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-sm font-semibold transition-all">
              Admin & Staff Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-16 flex flex-col justify-center items-center">
        {/* Hero Section */}
        <div className="max-w-3xl text-center mb-16 animate-in slide-in-from-bottom-6 fade-in duration-500">
          <span className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200/60 rounded-full border border-slate-300/40 inline-block mb-4">
            Department of Information Technology
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Sona IT Library Portal
          </h2>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            Log in to access your digital library profile, track your entry and exit history, and view your study duration records.
          </p>
        </div>

        {/* Portal Access Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl w-full">
          {/* Student Portal Card */}
          <Card className="bg-white border-slate-200 hover:border-slate-400 transition-all duration-300 group hover:shadow-xl flex flex-col justify-between">
            <CardHeader className="p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Student Portal
              </CardTitle>
              <CardDescription className="text-slate-500 text-base mt-2 leading-relaxed">
                Sign in with your Admission Number to view your personal dashboard, daily visits logs, and total library hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0">
              <Link href="/student/login" className="block w-full">
                <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 rounded-lg transition-all shadow-md hover:shadow-lg">
                  Student Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Faculty Portal Card */}
          <Card className="bg-white border-slate-200 hover:border-slate-400 transition-all duration-300 group hover:shadow-xl flex flex-col justify-between">
            <CardHeader className="p-8">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Faculty Portal
              </CardTitle>
              <CardDescription className="text-slate-500 text-base mt-2 leading-relaxed">
                Sign in with your Faculty ID or registered email to view your visit history and check logs for academic tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0">
              <Link href="/faculty/login" className="block w-full">
                <Button variant="outline" className="w-full h-12 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold flex items-center justify-center gap-2 rounded-lg transition-all">
                  Faculty Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 py-8 text-center text-slate-500 border-t border-slate-200 mt-auto">
        <div className="container mx-auto px-6">
          <p className="font-semibold text-slate-600">Sona College of Technology</p>
          <p className="text-slate-500 text-xs mt-1">Department of Information Technology</p>
          <div className="mt-4 flex gap-4 justify-center text-slate-400 text-xs">
            <Link href="/student/login" className="hover:text-slate-600 transition-colors">Student Portal</Link>
            <span>&bull;</span>
            <Link href="/faculty/login" className="hover:text-slate-600 transition-colors">Faculty Portal</Link>
            <span>&bull;</span>
            <Link href="/admin" className="hover:text-slate-600 transition-colors font-medium text-slate-500">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
