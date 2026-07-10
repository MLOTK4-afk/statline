"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/ToastContext";

export function ShareLinkButton({ athleteId }: { athleteId: string }) {
  const { showToast } = useToast();

  function handleClick() {
    const url = `${window.location.origin}/athletes/${athleteId}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Profile link copied");
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      Link
    </Button>
  );
}
