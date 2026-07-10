import type { Metadata } from "next";
import { InternationalProfileWizard } from "@/components/wizard/InternationalProfileWizard";
import { EntryGates } from "@/components/onboarding/EntryGates";

export const metadata: Metadata = {
  title: "Build International Profile | Statline",
};

export default function InternationalBuildProfilePage() {
  return (
    <EntryGates>
      <InternationalProfileWizard />
    </EntryGates>
  );
}
