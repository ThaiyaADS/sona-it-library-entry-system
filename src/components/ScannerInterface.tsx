"use client";

import { useState, useEffect, useRef } from "react";
import { processScan, ScanResult } from "@/actions/scanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  User, 
  Loader2, 
  XCircle, 
  ArrowLeft,
  Clock,
  Wifi,
  Terminal,
  Scan,
  ShieldAlert,
  Sun,
  Moon
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

const playSound = async (type: "ENTRY" | "EXIT" | "WARNING") => {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
    
    if (type === "ENTRY") {
      // Pleasant high-pitched single beep (880Hz, A5) for success entry
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Louder volume (0.3)
      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.18);
    } else if (type === "EXIT") {
      // Pleasant upward chime (554.37Hz -> 880Hz) for exit
      const duration = 0.28;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(554.37, audioCtx.currentTime); // C#5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + duration); // Up to A5
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Louder volume (0.3)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } else if (type === "WARNING") {
      // Buzz / lower warning beep (150Hz -> 100Hz)
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.25);
      
      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime); // Louder volume (0.4)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (error) {
    console.warn("Web Audio API warning:", error);
  }
};

export default function ScannerInterface({ initialScans }: { initialScans: any[] }) {
  const [barcode, setBarcode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>(initialScans);
  const [time, setTime] = useState(new Date());
  const [theme, setTheme] = useState<"light" | "dark">("light"); // Light theme by default
  const [mounted, setMounted] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Live clock
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-initialize/resume AudioContext on first user click/keypress to bypass autoplay restrictions
  useEffect(() => {
    const initAudio = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const tempCtx = new AudioContextClass();
          if (tempCtx.state === "suspended") {
            tempCtx.resume();
          }
        }
      } catch (e) {}
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
    window.addEventListener("click", initAudio);
    window.addEventListener("keydown", initAudio);
    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
  }, []);

  // Auto-focus input
  useEffect(() => {
    const focusTimer = setInterval(() => {
      if (document.activeElement !== inputRef.current && !isProcessing && !result) {
        inputRef.current?.focus();
      }
    }, 1000);
    return () => clearInterval(focusTimer);
  }, [isProcessing, result]);

  // Clear popup after a few seconds
  useEffect(() => {
    if (result) {
      const clearTimer = setTimeout(() => {
        setResult(null);
        setBarcode("");
      }, 7000);
      return () => clearTimeout(clearTimer);
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || isProcessing) return;

    setIsProcessing(true);
    setResult(null);

    const scanRes = await processScan(barcode.trim());
    setResult(scanRes);
    
    if (scanRes.success && scanRes.user) {
      if (scanRes.type === "ENTRY") {
        playSound("ENTRY");
      } else {
        playSound("EXIT");
      }
      const newScan = {
        id: Math.random().toString(),
        user: {
          name: scanRes.user.name,
          identifier: scanRes.user.identifier,
          department: scanRes.user.department,
          role: scanRes.user.role,
        },
        entryTime: scanRes.entryTime,
        exitTime: scanRes.exitTime,
        durationMinutes: scanRes.duration ? parseInt(scanRes.duration) : null,
        status: scanRes.type === "ENTRY" ? "INSIDE" : "COMPLETED",
      };
      
      setRecentScans((prev) => [newScan, ...prev.slice(0, 9)]);
    } else {
       playSound("WARNING");
       setBarcode("");
    }

    setIsProcessing(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col justify-between relative overflow-hidden py-8 px-4 transition-colors duration-500 ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      {/* Background Decorative Glows */}
      <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
        isDark ? "bg-cyan-900/10" : "bg-cyan-200/20"
      }`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
        isDark ? "bg-blue-900/10" : "bg-blue-200/20"
      }`} />

      {/* Top Navigation & Controls */}
      <div className="max-w-6xl w-full mx-auto flex justify-between items-center z-10 mb-6">
        <Link 
          href="/admin" 
          className={`text-xs flex items-center gap-1.5 font-bold transition-all border py-2 px-4 rounded-xl shadow-sm ${
            isDark 
              ? "bg-slate-900/60 border-white/5 text-slate-300 hover:text-white" 
              : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Animated Theme Toggle Button */}
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className={`w-9 h-9 rounded-xl transition-all duration-300 cursor-pointer ${
              isDark 
                ? "bg-slate-900/60 border-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300" 
                : "bg-white border-slate-200 hover:bg-slate-50 text-indigo-600 hover:text-indigo-700"
            }`}
            title="Toggle theme mode"
          >
            <div className="transition-transform duration-500 ease-out hover:rotate-[360deg] active:scale-90">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
          </Button>

          <div className={`flex items-center gap-2 border py-1.5 px-4 rounded-xl text-xs font-bold shadow-sm ${
            isDark 
              ? "bg-slate-900/60 border-white/5 text-emerald-400" 
              : "bg-white border-slate-200 text-emerald-600"
          }`}>
            <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Gate Scanner Active</span>
          </div>
        </div>
      </div>

      {/* Center Layout Header */}
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center z-10 mb-8">
        <Image 
          src="/logo.png" 
          alt="Sona College Logo" 
          width={160} 
          height={50} 
          className={`object-contain p-2 rounded-2xl shadow-md border mb-4 transition-all duration-500 ${
            isDark ? "bg-white/95 border-white/10" : "bg-white border-slate-200"
          }`} 
        />
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-wider transition-all duration-500 ${
          isDark 
            ? "bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400" 
            : "text-slate-800"
        }`}>
          LIBRARY SCANNER GATEWAY
        </h1>
        <p className={`mt-2 text-sm max-w-md transition-colors duration-500 ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}>
          Position your barcode under the reader or input manually to record Entry / Exit logs.
        </p>

        {/* Live Clock Widget */}
        <div className={`mt-4 inline-flex items-center gap-2 border px-6 py-2.5 rounded-full font-mono text-sm shadow-sm transition-all duration-500 ${
          isDark 
            ? "bg-slate-900/80 border-white/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
            : "bg-white border-slate-200 text-cyan-600 shadow-slate-100"
        }`}>
          <Clock className={`w-4 h-4 animate-spin-slow ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span>{mounted ? format(time, "EEEE, MMMM do, yyyy") : "Loading date..."}</span>
          <span className={isDark ? "text-slate-700" : "text-slate-300"}>|</span>
          <span className="font-bold tracking-widest">{mounted ? format(time, "hh:mm:ss a") : "Loading time..."}</span>
        </div>
      </div>

      {/* Main Action Grid */}
      <main className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 items-start flex-1 mb-8">
        
        {/* Left Side: Scanning Zone */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className={`border shadow-lg rounded-3xl overflow-hidden relative transition-all duration-500 ${
            isDark ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200/80"
          }`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle className={`text-lg flex items-center gap-2 tracking-wide font-bold transition-colors duration-500 ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}>
                <Scan className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} /> Scan Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              
              {/* Sci-Fi Target Scan Frame */}
              <div className={`w-full border-2 border-dashed rounded-2xl relative overflow-hidden p-8 flex flex-col items-center justify-center min-h-[220px] transition-all duration-500 ${
                isDark 
                  ? "border-cyan-500/20 bg-slate-950/60" 
                  : "border-cyan-500/25 bg-slate-50/50"
              }`}>
                
                {/* Horizontal Laser Line Animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_12px_#06b6d4] animate-pulse pointer-events-none" style={{
                  animation: "scan 3s linear infinite",
                  top: "0%"
                }} />

                <style jsx global>{`
                  @keyframes scan {
                    0% { top: 5%; }
                    50% { top: 95%; }
                    100% { top: 5%; }
                  }
                `}</style>

                <Scan className={`w-16 h-16 transition-colors duration-500 mb-4 ${
                  isDark ? "text-cyan-500/20" : "text-cyan-500/15"
                }`} />
                
                <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center">
                  <Input
                    ref={inputRef}
                    id="barcode"
                    type="text"
                    placeholder="Scanning input active..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className={`text-lg text-center h-12 rounded-xl transition-all duration-500 ${
                      isDark 
                        ? "bg-slate-900/60 border-cyan-500/20 text-cyan-300 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-cyan-400/20" 
                        : "bg-white border-cyan-500/30 text-cyan-700 placeholder:text-slate-300 focus:border-cyan-500 focus:ring-cyan-500/10 shadow-inner"
                    }`}
                    autoComplete="off"
                    autoFocus
                    disabled={isProcessing}
                  />
                  <div className={`mt-4 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 transition-colors duration-500 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                        <span>PROCESSING CODE...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>WAITING FOR BARCODE READ...</span>
                      </>
                    )}
                  </div>
                </form>
              </div>

              {/* Bottom Instructions */}
              <div className={`mt-4 text-xs text-center leading-relaxed transition-colors duration-500 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}>
                Connect your USB barcode scanner. Keep this browser window focused. The scanner will input text and trigger automatically.
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Side: Log Console */}
        <div className="lg:col-span-7">
          <Card className={`border shadow-lg rounded-3xl overflow-hidden flex flex-col min-h-[420px] transition-all duration-500 ${
            isDark ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200/80"
          }`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-400/20" />
            <CardHeader className={`border-b py-4 px-6 flex flex-row justify-between items-center transition-colors duration-500 ${
              isDark ? "border-white/5" : "border-slate-100"
            }`}>
              <CardTitle className={`text-lg flex items-center gap-2 font-bold tracking-wide transition-colors duration-500 ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}>
                <Terminal className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} /> Activity Log
              </CardTitle>
              <Badge variant="secondary" className={`font-mono border transition-all duration-500 ${
                isDark 
                  ? "bg-slate-800 text-slate-400 border-white/5" 
                  : "bg-slate-100 text-slate-500 border-slate-200/60"
              }`}>
                LIVE FEED
              </Badge>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col overflow-y-auto max-h-[460px] min-h-[380px]">
              <div className="space-y-4 flex-1">
                {recentScans.map((scan, i) => {
                  const nameInitials = scan.user.name.charAt(0).toUpperCase();
                  const isInside = scan.status === "INSIDE";
                  const logTime = scan.exitTime 
                    ? new Date(scan.exitTime) 
                    : scan.entryTime 
                      ? new Date(scan.entryTime) 
                      : new Date();

                  return (
                    <div 
                      key={scan.id || i} 
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        isDark 
                          ? "bg-slate-900/40 border-white/5 hover:border-cyan-500/20" 
                          : "bg-white border-slate-200/80 hover:border-cyan-500/30 shadow-xs hover:shadow-md"
                      }`}
                    >
                      {/* Left side: Avatar + User Info */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm tracking-wider ${
                          scan.user.role === "FACULTY"
                            ? (isDark ? "bg-amber-950/80 text-amber-400 border border-amber-500/20" : "bg-amber-100 text-amber-700")
                            : (isDark ? "bg-blue-950/80 text-blue-400 border border-blue-500/20" : "bg-blue-100 text-blue-700")
                        }`}>
                          {nameInitials}
                        </div>
                        <div>
                          <p className={`font-extrabold text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {scan.user.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                            <span>{scan.user.identifier}</span>
                            <span className="text-slate-600">•</span>
                            <span>{scan.user.department}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Status and Time */}
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider ${
                          isInside
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-cyan-500/10 text-cyan-600 border border-cyan-500/20"
                        }`}>
                          {isInside ? "ENTRY CHECK-IN" : "EXIT CHECK-OUT"}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{format(logTime, "hh:mm:ss a")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {recentScans.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
                    <Terminal className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="font-bold text-slate-700 text-base">No active logs</p>
                    <p className="text-sm text-slate-500 mt-1">Logs cleared successfully.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </main>

      {/* Floating Status Popup Overlay - NOW CENTERED AS AN INTERACTIVE MODAL */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl relative animate-in zoom-in-95 duration-300 ${
            result.success 
              ? (result.type === 'ENTRY' 
                  ? 'bg-white border-emerald-200 text-slate-800' 
                  : 'bg-white border-cyan-200 text-slate-800') 
              : 'bg-white border-red-200 text-slate-800'
          }`}>
            <div className="flex flex-col items-center text-center p-2">
              <div className="mb-4">
                {result.success ? (
                   <CheckCircle2 className={`w-16 h-16 ${result.type === 'ENTRY' ? 'text-emerald-500' : 'text-cyan-500'}`} />
                ) : (
                   <XCircle className="w-16 h-16 text-red-500" />
                )}
              </div>
              
              <h3 className="text-xl font-extrabold tracking-wide mb-3 leading-snug text-slate-800">
                {result.message}
              </h3>
              
              {result.success && result.user && (
                <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-left text-xs bg-slate-50/50 p-4 rounded-2xl">
                   <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Member Name</p>
                      <p className="font-semibold mt-0.5 text-slate-800">{result.user.name}</p>
                   </div>
                   <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Identifier ID</p>
                      <p className="font-mono mt-0.5 text-slate-800">{result.user.identifier}</p>
                   </div>
                   <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Department</p>
                      <p className="mt-0.5 text-slate-800 truncate">{result.user.department}</p>
                   </div>
                   <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Role Type</p>
                      <Badge variant="outline" className="mt-0.5 py-0 px-2 h-5 text-[9px] border-slate-200 text-slate-600 bg-white shadow-xs">
                         {result.user.role}
                      </Badge>
                   </div>
                </div>
              )}

              {/* Dismiss Button */}
              <div className="mt-6 w-full">
                <Button 
                  onClick={() => {
                    setResult(null);
                    setBarcode("");
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 50);
                  }}
                  className={`w-full py-3 h-12 text-sm font-bold text-white shadow-md rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all ${
                    result.success 
                      ? (result.type === 'ENTRY' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/10')
                      : 'bg-red-600 hover:bg-red-500 shadow-red-600/10'
                  }`}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className={`w-full text-center text-xs mt-auto pt-6 border-t z-10 transition-colors duration-500 ${
        isDark ? "border-white/5 text-slate-600" : "border-slate-200/60 text-slate-500"
      }`}>
        <p className={`font-semibold transition-colors duration-500 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Sona College of Technology</p>
        <p className="text-[10px] mt-0.5">Salem, Tamil Nadu, India | Department of Information Technology</p>
      </footer>

    </div>
  );
}
