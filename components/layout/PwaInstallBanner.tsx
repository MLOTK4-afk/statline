"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const DISMISS_KEY = "statline-pwa-banner-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    const timer = setTimeout(() => {
      if (isIos() || deferredPrompt) {
        setVisible(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (deferredPrompt) setVisible(true);
  }, [deferredPrompt]);

  function dismiss() {
    setVisible(false);
    setShowIosInstructions(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        dismiss();
      } else {
        setVisible(false);
      }
      setDeferredPrompt(null);
      return;
    }
    if (isIos()) {
      setShowIosInstructions(true);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-md px-4 md:bottom-6">
      <div className="rounded-xl border border-white/10 bg-navy-800 p-4 shadow-2xl">
        {showIosInstructions ? (
          <div>
            <p className="text-sm text-slate-200">
              To install Statline: tap the Share icon in Safari, then select
              &ldquo;Add to Home Screen.&rdquo;
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-3 text-sm font-semibold text-electric-500 hover:text-electric-600"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                Install Statline
              </p>
              <p className="text-xs text-slate-400">
                Add Statline to your home screen for faster access.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleInstall}>
              Install
            </Button>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="text-slate-500 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
