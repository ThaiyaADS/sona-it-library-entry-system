import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, User, Users, Shield, Clock } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Sona College Logo" width={180} height={60} className="object-contain bg-white/10 p-1 rounded-md" />
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <h1 className="text-2xl font-bold tracking-tight">IT Library</h1>
              <p className="text-slate-400 text-sm">Department of Information Technology</p>
            </div>
          </div>
          <nav className="flex gap-4">
            <Link href="/scanner">
               <Button variant="secondary" className="bg-slate-100 text-slate-900 hover:bg-white border-0 shadow-sm font-semibold">
                 Launch Scanner
               </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="max-w-3xl text-center mb-16 animate-in slide-in-from-bottom-6 fade-in duration-500">
           <Badge variant="outline" className="mb-4 text-slate-600 bg-white shadow-sm border-slate-200">Sona College of Technology</Badge>
           <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
             Smart Library Entry Management
           </h2>
           <p className="text-xl text-slate-500">
             Fast, secure, and automated tracking of student and faculty library visits using barcode scanning.
           </p>
           
           <div className="mt-10 flex gap-4 justify-center">
             <Link href="/scanner">
               <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200">
                 <BookOpen className="mr-2" />
                 Scan Library Entry
               </Button>
             </Link>
             <Link href="/student/login">
               <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                 Student Login
               </Button>
             </Link>
             <Link href="/faculty/login">
               <Button variant="ghost" size="lg" className="h-14 px-6 text-lg rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                 Faculty Login
               </Button>
             </Link>
           </div>
        </div>
        
      </main>

      <footer className="bg-slate-100 py-8 text-center text-slate-500 border-t border-slate-200 mt-auto">
         <p className="font-medium text-slate-600">Sona College of Technology — Department of Information Technology</p>
         <div className="mt-4 text-sm flex gap-4 justify-center text-slate-400">
            <Link href="/admin/login" className="hover:text-slate-600 transition-colors">Admin Login</Link>
            <span>&bull;</span>
            <Link href="/student/login" className="hover:text-slate-600 transition-colors">Student Login</Link>
            <span>&bull;</span>
            <Link href="/faculty/login" className="hover:text-slate-600 transition-colors">Faculty Login</Link>
         </div>
      </footer>
    </div>
  );
}

// Inline badge component for simple usage here without importing if not available yet
function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
      {children}
    </span>
  );
}
