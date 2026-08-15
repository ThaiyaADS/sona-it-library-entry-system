"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

interface LoginFormProps {
  title: string;
  description: string;
  identifierLabel: string;
  identifierName: string;
  action: (formData: FormData) => Promise<any>;
  homeLink?: boolean;
  hidePassword?: boolean;
  passwordLabel?: string;
}

export default function LoginForm({ 
  title, 
  description, 
  identifierLabel, 
  identifierName, 
  action, 
  homeLink = true,
  hidePassword = false,
  passwordLabel
}: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    if (hidePassword) {
      const identifierVal = formData.get(identifierName) as string;
      formData.set("password", identifierVal);
    }
    
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl bg-white border-slate-200 text-slate-800 dark:bg-slate-900/60 dark:border-white/10 dark:text-slate-100 rounded-3xl relative overflow-hidden backdrop-blur-md transition-colors duration-500">
      {/* Theme Toggle Button at top right of the card */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Visual background gradient accents inside the card */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none hidden dark:block" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none hidden dark:block" />

      <CardHeader className="space-y-2 text-center pb-4 pt-8 z-10">
        <div className="flex justify-center mb-5">
          <Link href="/" className="transition-all duration-300 hover:scale-105 active:scale-95 block">
            <Image 
              src="/logo.png" 
              alt="Sona College Logo" 
              width={180} 
              height={55} 
              className="object-contain bg-white/95 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-md cursor-pointer" 
              priority
            />
          </Link>
        </div>
        <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-b dark:from-white dark:via-slate-100 dark:to-slate-300">{title}</CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="z-10 relative">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">{identifierLabel}</Label>
            <Input 
              id="identifier" 
              name={identifierName} 
              type="text" 
              required 
              className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 rounded-xl transition-all dark:bg-slate-950/60 dark:border-white/10 dark:text-white dark:placeholder:text-slate-600" 
              placeholder={`Enter ${identifierLabel.toLowerCase()}`}
            />
          </div>
          {!hidePassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">{passwordLabel || "Password"}</Label>
                 {title !== "Admin Login" && (
                    <Link href="#" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                       Forgot password?
                    </Link>
                 )}
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="h-12 pr-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 rounded-xl transition-all dark:bg-slate-950/60 dark:border-white/10 dark:text-white dark:placeholder:text-slate-600" 
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-12 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/15 hover:shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </CardContent>

      {homeLink && (
         <CardFooter className="justify-center border-t border-slate-100 dark:border-white/5 pt-5 pb-6 z-10 relative">
            <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs transition-colors font-bold flex items-center gap-1.5">
               <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal Home
            </Link>
         </CardFooter>
      )}
    </Card>
  );
}
