"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  console.log('Providers rendered');
  try {
    return <SessionProvider>{children}</SessionProvider>;
  } catch (error) {
    console.error('Providers error:', error);
    return <>{children}</>;
  }
}
