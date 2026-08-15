"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

if (process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && (
      args[0].includes('Encountered a script tag') || 
      args[0].includes("Can't perform a React state update on a component that hasn't mounted yet") ||
      args[0].includes('Hydration failed') ||
      args[0].includes('React server rendered HTML') ||
      args[0].includes('mismatch')
    )) {
      return;
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
