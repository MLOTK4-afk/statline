"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const ENTER_MS = 220;
const EXIT_MS = 150;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";

export function Modal({
  children,
  onClose,
  labelledBy,
  open = true,
}: {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
  /**
   * Pass the caller's own open/close state (and keep rendering <Modal>
   * unconditionally while it's false) so the exit can animate before the
   * modal actually unmounts. Callers that instead unmount Modal themselves
   * right away (one-time entry gates that transition straight to different
   * content, not a close-and-return flow) can omit this -- they still get
   * the entry animation, just not an animated exit.
   */
  open?: boolean;
}) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }
    setVisible(false);
    const timeout = setTimeout(() => setRendered(false), EXIT_MS);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!rendered) return;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true))
    );
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendered]);

  if (!rendered) return null;

  const duration = visible ? ENTER_MS : EXIT_MS;
  const ease = visible ? EASE_OUT : EASE_IN_OUT;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-[250] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ${ease}`,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          transform: visible ? "scale(1)" : "scale(0.94)",
          opacity: visible ? 1 : 0,
          transition: `transform ${duration}ms ${ease}, opacity ${duration}ms ${ease}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
