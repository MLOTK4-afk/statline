import type { Metadata } from "next";
import { ProfileWizard } from "@/components/wizard/ProfileWizard";
import { EntryGates } from "@/components/onboarding/EntryGates";

export const metadata: Metadata = {
  title: "Build Your Profile | Statline",
};

export default function BuildProfilePage() {
  return (
    <EntryGates>
      <ProfileWizard />
    </EntryGates>
  );
}
