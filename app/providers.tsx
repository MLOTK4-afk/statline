"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/lib/toast/ToastContext";
import { CompareProvider } from "@/lib/compare/CompareContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CompareProvider>{children}</CompareProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
