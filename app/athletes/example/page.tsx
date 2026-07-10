import type { Metadata } from "next";
import { EXAMPLE_PROFILE } from "@/lib/exampleProfile";
import { ExampleBanner } from "@/components/profile/ExampleBanner";
import { ProfileFull } from "@/components/profile/ProfileFull";

export const metadata: Metadata = {
  title: "Example Profile | Statline",
  description:
    "A sample Statline athlete profile showing what a completed, polished profile looks like.",
};

export default function ExampleProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <ExampleBanner />
      </div>
      <ProfileFull athlete={EXAMPLE_PROFILE} />
    </div>
  );
}
