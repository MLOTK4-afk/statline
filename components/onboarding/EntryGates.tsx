"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { hasAgeVerified } from "@/lib/ageGate";
import { SITE_PRICE } from "@/lib/siteConfig";
import { AgeGateModal } from "./AgeGateModal";
import { PricingGateModal } from "./PricingGateModal";

/**
 * Gates entry to the profile builder: age verification, then (only when
 * SITE_PRICE > 0) a payment confirmation step. Renders nothing until the
 * localStorage check resolves, to avoid a flash of the wizard underneath.
 */
export function EntryGates({ children }: { children: ReactNode }) {
  const [ageOk, setAgeOk] = useState<boolean | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    setAgeOk(hasAgeVerified());
  }, []);

  if (ageOk === null) return null;
  if (!ageOk) return <AgeGateModal onEligible={() => setAgeOk(true)} />;
  if (SITE_PRICE > 0 && !paid) {
    return <PricingGateModal onPaid={() => setPaid(true)} />;
  }
  return <>{children}</>;
}
