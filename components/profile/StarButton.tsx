"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function StarButton({ athleteId }: { athleteId: string }) {
  const [starred, setStarred] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user?.starredAthletes?.includes(athleteId)) setStarred(true);
      })
      .catch(() => {});
  }, [athleteId]);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/users/me/star", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId }),
    });
    if (res.ok) setStarred((v) => !v);
    setLoading(false);
  }

  return (
    <Button variant={starred ? "primary" : "outline"} size="sm" onClick={toggle} disabled={loading}>
      {starred ? "★ Starred" : "☆ Star Athlete"}
    </Button>
  );
}
