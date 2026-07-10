"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { getStoredRole } from "@/lib/roleStorage";
import { cn } from "@/lib/cn";

export function HeroCTAs() {
  const [highlightBuild, setHighlightBuild] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setHighlightBuild(getStoredRole() === "athlete");
  }, []);

  useEffect(() => {
    if (searchParams.get("scrollTo") !== "build-profile") return;
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div
      id="build-profile-section"
      ref={sectionRef}
      className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
    >
      <LinkButton
        href="/build-profile"
        size="lg"
        className={cn(
          highlightBuild &&
            "ring-2 ring-electric-500 ring-offset-2 ring-offset-navy-900"
        )}
      >
        Build Your Profile
      </LinkButton>
      <LinkButton href="/browse" variant="outline" size="lg">
        Browse Athletes
      </LinkButton>
    </div>
  );
}
