"use client";

import { useState, useEffect, useRef } from "react";
import { processScan, ScanResult } from "@/actions/scanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, User, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function ScannerInterface({ initialScans }: { initialScans: any[] }) {
  const [barcode, setBarcode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>(initialScans);
  const [time, setTime] = useState(new Date());
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-focus input
  useEffect(() => {
    const focusTimer = setInterval(() => {
      if (document.activeElement !== inputRef.current && !isProcessing) {
        inputRef.current?.focus();
      }
    }, 1000);
    return () => clearInterval(focusTimer);
  }, [isProcessing]);

  // Clear popup after a few seconds
  useEffect(() => {
    if (result) {
      const clearTimer = setTimeout(() => {
        setResult(null);
        setBarcode("");
      }, 5000);
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
    
    // Optimistically update recent scans if successful
    if (scanRes.success && scanRes.user) {
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
       // Clear input if failed so they can try again quickly
       setBarcode("");
    }

    setIsProcessing(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">LIBRARY SCANNER</h1>
        <p className="text-slate-500 mt-2 text-lg">Scan barcode to record entry or exit</p>
        <div className="mt-4 text-2xl font-mono bg-slate-100 py-2 px-6 rounded-full inline-block text-slate-800">
          {format(time, "EEEE, MMMM do, yyyy")} <span className="mx-2">|</span> {format(time, "hh:mm:ss a")}
        </div>
      </div>

      <Card className="shadow-lg border-2 border-slate-200 mb-8">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
             <label htmlFor="barcode" className="text-sm font-medium text-slate-700 mb-2">
                Enter Admission Number / Faculty ID
             </label>
            <div className="flex w-full max-w-lg gap-2">
              <Input
                ref={inputRef}
                id="barcode"
                type="text"
                placeholder="Scan or type here..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="text-2xl text-center h-14"
                autoComplete="off"
                autoFocus
                disabled={isProcessing}
              />
              <Button type="submit" size="lg" className="h-14 px-8 text-lg bg-slate-900 hover:bg-slate-800" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="animate-spin" /> : "Process"}
              </Button>
            </div>
            
            <div className="mt-6 text-sm font-medium text-slate-400 uppercase tracking-widest">
              {isProcessing ? "PROCESSING..." : "READY TO SCAN"}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Result Popup */}
      {result && (
        <div className={`mb-8 p-6 rounded-xl border-2 shadow-xl animate-in fade-in slide-in-from-bottom-4 ${result.success ? (result.type === 'ENTRY' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200') : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-4">
            {result.success ? (
               <CheckCircle2 className={`w-12 h-12 ${result.type === 'ENTRY' ? 'text-green-600' : 'text-blue-600'}`} />
            ) : (
               <XCircle className="w-12 h-12 text-red-600" />
            )}
            
            <div className="flex-1">
              <h3 className={`text-2xl font-bold mb-2 ${result.success ? (result.type === 'ENTRY' ? 'text-green-800' : 'text-blue-800') : 'text-red-800'}`}>
                {result.message}
              </h3>
              
              {result.success && result.user && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <div>
                      <p className="text-sm text-slate-500 uppercase font-semibold">User Type</p>
                      <Badge variant={result.user.role === 'FACULTY' ? 'secondary' : 'default'} className="mt-1">
                         {result.user.role}
                      </Badge>
                   </div>
                   <div>
                      <p className="text-sm text-slate-500 uppercase font-semibold">Name</p>
                      <p className="font-medium text-lg text-slate-900">{result.user.name}</p>
                   </div>
                   <div>
                      <p className="text-sm text-slate-500 uppercase font-semibold">ID</p>
                      <p className="font-medium text-slate-900">{result.user.identifier}</p>
                   </div>
                   <div>
                      <p className="text-sm text-slate-500 uppercase font-semibold">Department</p>
                      <p className="font-medium text-slate-900">{result.user.department}</p>
                   </div>
                   
                   <div className="col-span-2 mt-2 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4">
                      <div>
                         <p className="text-sm text-slate-500 uppercase font-semibold">Entry Time</p>
                         <p className="font-mono text-slate-900">{result.entryTime ? format(result.entryTime, "hh:mm a") : "-"}</p>
                      </div>
                      {result.type === 'EXIT' && (
                         <>
                           <div>
                              <p className="text-sm text-slate-500 uppercase font-semibold">Exit Time</p>
                              <p className="font-mono text-slate-900">{result.exitTime ? format(result.exitTime, "hh:mm a") : "-"}</p>
                           </div>
                           <div>
                              <p className="text-sm text-slate-500 uppercase font-semibold">Time Spent</p>
                              <p className="font-mono font-bold text-slate-900">{result.duration}</p>
                           </div>
                         </>
                      )}
                   </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setResult(null)}>
              <XCircle className="w-5 h-5 text-slate-400" />
            </Button>
          </div>
        </div>
      )}

      {/* Recent Scans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Dept</th>
                  <th className="px-4 py-3">Entry</th>
                  <th className="px-4 py-3">Exit</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan, i) => (
                  <tr key={scan.id || i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                       <User className="w-4 h-4 text-slate-400" />
                       {scan.user.name}
                       <Badge variant="outline" className="text-[10px] h-4 px-1">{scan.user.role.substring(0, 3)}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">{scan.user.identifier}</td>
                    <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{scan.user.department}</td>
                    <td className="px-4 py-3 font-mono">{scan.entryTime ? format(new Date(scan.entryTime), "hh:mm a") : "-"}</td>
                    <td className="px-4 py-3 font-mono">{scan.exitTime ? format(new Date(scan.exitTime), "hh:mm a") : "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={scan.status === 'INSIDE' ? 'default' : 'secondary'} className={scan.status === 'INSIDE' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-slate-100 text-slate-800 hover:bg-slate-100'}>
                        {scan.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {recentScans.length === 0 && (
                   <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                         No recent activity today.
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
