"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { calculateAge, setAgeVerified } from "@/lib/ageGate";
import { useToast } from "@/lib/toast/ToastContext";

export function AgeGateModal({ onEligible }: { onEligible: () => void }) {
  const [dob, setDob] = useState("");
  const [blocked, setBlocked] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  function handleCancel() {
    router.push("/");
  }

  function handleConfirm() {
    if (!dob) {
      showToast("Please enter your date of birth");
      return;
    }
    const age = calculateAge(dob);
    if (age < 13) {
      setBlocked(true);
      return;
    }
    setAgeVerified();
    onEligible();
  }

  return (
    <Modal onClose={handleCancel} labelledBy="age-gate-title">
      <Card className="w-full max-w-sm p-8">
        <h2 id="age-gate-title" className="text-2xl text-white">
          Before you continue
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          We ask every athlete for their date of birth before building a
          profile.
        </p>

        <div className="mt-6">
          <Label htmlFor="dob" required>
            Your date of birth
          </Label>
          <Input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              setBlocked(false);
            }}
          />
        </div>

        {blocked ? (
          <div className="mt-5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            Parental consent required. Please have a parent or guardian email
            us at{" "}
            <a href="mailto:statlinework@gmail.com" className="underline">
              statlinework@gmail.com
            </a>{" "}
            to set up your account.
          </div>
        ) : (
          <Button className="mt-6 w-full" onClick={handleConfirm}>
            Confirm & Continue
          </Button>
        )}
      </Card>
    </Modal>
  );
}
