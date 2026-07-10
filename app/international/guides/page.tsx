import type { Metadata } from "next";
import { GuidesPageContent } from "@/components/international/GuidesPageContent";

export const metadata: Metadata = {
  title: "International Recruiting Guides | Statline",
};

export default function GuidesPage() {
  return <GuidesPageContent />;
}
