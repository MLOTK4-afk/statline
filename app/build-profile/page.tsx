import type { Metadata } from "next";
import { ProfileWizard } from "@/components/wizard/ProfileWizard";
import { EntryGates } from "@/components/onboarding/EntryGates";
import { PhotoHeader } from "@/components/ui/PhotoHeader";

export const metadata: Metadata = {
  title: "Build Your Profile | Statline",
};

export default function BuildProfilePage() {
  return (
    <div>
      <PhotoHeader
        eyebrow="Your Profile"
        title="Build Your Profile"
        subtitle="Turn your season into a recruiting profile coaches can actually find."
        photoUrl="/images/build-profile-swim.jpg"
        photoPosition="center 25%"
      />
      <EntryGates>
        <ProfileWizard />
      </EntryGates>
    </div>
  );
}
