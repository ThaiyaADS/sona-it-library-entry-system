"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9 rounded-xl border-slate-200 dark:border-white/10 text-slate-400 bg-white/5 cursor-wait"
        disabled
      >
        <Moon className="w-4 h-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      variant="outline"
      size="icon"
      className="w-9 h-9 rounded-xl transition-all duration-300 cursor-pointer bg-white border-slate-200 text-indigo-600 hover:bg-slate-50 hover:text-indigo-700 dark:bg-slate-900/60 dark:border-white/5 dark:text-amber-400 dark:hover:bg-white/10 dark:hover:text-amber-300 shadow-sm"
      title="Toggle color theme"
    >
      <div className="transition-transform duration-500 ease-out hover:rotate-[360deg] active:scale-90 flex items-center justify-center">
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </div>
    </Button>
  );
}
