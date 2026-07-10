"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SITE_PRICE } from "@/lib/siteConfig";

export function PricingGateModal({ onPaid }: { onPaid: () => void }) {
  const router = useRouter();

  function handleCancel() {
    router.push("/");
  }

  function handlePay() {
    // Wire Stripe here when ready
    onPaid();
  }

  return (
    <Modal onClose={handleCancel} labelledBy="pricing-gate-title">
      <Card className="w-full max-w-sm p-8">
        <h2 id="pricing-gate-title" className="text-2xl text-white">
          Build Your Statline Profile
        </h2>
        <p className="mt-4 font-heading text-4xl text-electric-500">
          ${SITE_PRICE.toFixed(2)}
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Includes your published Statline profile, an AI-generated scouting
          report, and access to the coach directory and leaderboard.
        </p>
        <Button className="mt-6 w-full" onClick={handlePay}>
          Pay & Build Profile
        </Button>
      </Card>
    </Modal>
  );
}
