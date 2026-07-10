"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { getStoredRole, setStoredRole } from "@/lib/roleStorage";
import { AthleteIcon, CoachIcon } from "./RoleIcons";

export function RolePicker() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (getStoredRole() === null) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss("browse");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function dismiss(role: "athlete" | "coach" | "browse") {
    setStoredRole(role);
    setVisible(false);
  }

  function chooseAthlete() {
    dismiss("athlete");
    if (pathname === "/") {
      document
        .getElementById("build-profile-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      router.push("/?scrollTo=build-profile");
    }
  }

  function chooseCoach() {
    dismiss("coach");
    router.push("/browse");
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose how you'll use Statline"
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-navy-900 px-4 py-10"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <Image
          src="/logos/logo-no-tagline.png"
          alt="Statline"
          width={64}
          height={64}
          priority
        />

        <h1 className="mt-8 font-heading text-4xl uppercase leading-[1.05] text-white sm:text-5xl">
          Welcome to
          <br />
          <span className="text-electric-500">Statline</span>
        </h1>

        <p className="mt-4 text-[rgba(255,255,255,0.55)]">
          The recruiting platform built for athletes and coaches.
        </p>

        <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={chooseAthlete}
            className="rounded-[14px] border-2 border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.07)] px-5 py-7 text-left transition-colors duration-150 hover:border-electric-500 hover:bg-[rgba(59,130,246,0.12)]"
          >
            <div className="text-skyline-300">
              <AthleteIcon />
            </div>
            <div className="mt-3 font-heading text-lg font-bold uppercase tracking-wide text-white">
              I&apos;m an Athlete
            </div>
            <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
              Build a profile, share your stats and film, get found by
              coaches.
            </p>
          </button>

          <button
            type="button"
            onClick={chooseCoach}
            className="rounded-[14px] border-2 border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.07)] px-5 py-7 text-left transition-colors duration-150 hover:border-electric-500 hover:bg-[rgba(59,130,246,0.12)]"
          >
            <div className="text-skyline-300">
              <CoachIcon />
            </div>
            <div className="mt-3 font-heading text-lg font-bold uppercase tracking-wide text-white">
              I&apos;m a Coach
            </div>
            <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
              Browse athletes, star prospects, build your scouting board.
            </p>
          </button>
        </div>

        <button
          type="button"
          onClick={() => dismiss("browse")}
          className="mt-6 text-sm text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.6)]"
        >
          Just browsing — skip for now
        </button>
      </div>
    </div>
  );
}
