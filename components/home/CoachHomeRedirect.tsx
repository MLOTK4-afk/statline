"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredRole } from "@/lib/roleStorage";

/**
 * Returning coaches land on /browse instead of the homepage. Skipped when
 * ?scrollTo is present so the role picker's own "athlete" redirect back to
 * "/" never gets bounced onward to /browse.
 */
export function CoachHomeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("scrollTo")) return;
    if (getStoredRole() === "coach") router.replace("/browse");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
