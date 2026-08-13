"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface LoginFormProps {
  title: string;
  description: string;
  identifierLabel: string;
  identifierName: string;
  action: (formData: FormData) => Promise<any>;
  homeLink?: boolean;
}

export default function LoginForm({ title, description, identifierLabel, identifierName, action, homeLink = true }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-slate-200">
      <CardHeader className="space-y-2 text-center pb-6 pt-8">
        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">{title}</CardTitle>
        <CardDescription className="text-base text-slate-500">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-slate-700 font-semibold">{identifierLabel}</Label>
            <Input 
              id="identifier" 
              name={identifierName} 
              type="text" 
              required 
              className="h-12 border-slate-300 focus-visible:ring-slate-900 bg-slate-50" 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
               <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
               {title !== "Admin Login" && (
                  <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                     Forgot password?
                  </Link>
               )}
            </div>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="h-12 border-slate-300 focus-visible:ring-slate-900 bg-slate-50" 
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Login"}
          </Button>
        </form>
      </CardContent>
      {homeLink && (
         <CardFooter className="justify-center border-t border-slate-100 pt-6 pb-6">
            <Link href="/" className="text-slate-500 hover:text-slate-900 text-sm transition-colors font-medium">
               ← Back to Home
            </Link>
         </CardFooter>
      )}
    </Card>
  );
}
