"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DISPLAY_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<{ id: number; message: string } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const queueRef = useRef<string[]>([]);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    const next = queueRef.current.shift();
    if (next === undefined) {
      setCurrent(null);
      setLeaving(false);
      return;
    }
    idRef.current += 1;
    setLeaving(false);
    setCurrent({ id: idRef.current, message: next });
    timerRef.current = setTimeout(() => {
      setLeaving(true);
      setTimeout(advance, 200);
    }, DISPLAY_MS);
  }, []);

  const showToast = useCallback(
    (message: string) => {
      if (current === null) {
        queueRef.current.push(message);
        advance();
      } else {
        queueRef.current.push(message);
      }
    },
    [current, advance]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {current && (
        <div
          className="pointer-events-none fixed inset-x-0 z-[300] flex justify-center bottom-20 md:bottom-6"
          aria-live="polite"
        >
          <div
            className={`pointer-events-auto rounded-full bg-navy-900 px-5 py-2.5 text-sm text-white shadow-lg shadow-black/40 border border-white/10 ${
              leaving ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            {current.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
