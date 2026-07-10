import type { Metadata } from "next";
import { RecruitingBoardContent } from "@/components/international/RecruitingBoardContent";

export const metadata: Metadata = {
  title: "My Recruiting Board | Statline",
};

export default function RecruitingBoardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <RecruitingBoardContent />
    </div>
  );
}
