"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/ToastContext";

export function FollowButton({
  athleteId,
  ownerUserId,
}: {
  athleteId: string;
  ownerUserId: string;
}) {
  const { data: session, status } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user?.following?.includes(athleteId)) setFollowing(true);
      })
      .catch(() => {});
  }, [status, athleteId]);

  if (status !== "authenticated") return null;
  if (session?.user?.id === ownerUserId) return null;

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/users/me/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId }),
    });
    if (res.ok) {
      setFollowing((v) => !v);
      showToast(following ? "Unfollowed athlete" : "Now following athlete");
    }
    setLoading(false);
  }

  return (
    <Button variant={following ? "primary" : "outline"} size="sm" onClick={toggle} disabled={loading}>
      {following ? "Following" : "+ Follow"}
    </Button>
  );
}
