import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Statline",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="June 2026">
      <LegalSection title="Information We Collect">
        <p>
          When you create a Statline account, we collect the email address
          you sign up with. When you build an athlete profile, we collect the
          information you choose to submit — name, school or team, stats,
          achievements, contact information, and highlight video links.
        </p>
        <p>
          For coach accounts, we store your scouting activity within
          Statline: athletes you&apos;ve starred, the boards you create, and
          any notes you write about an athlete. That activity and those notes
          are visible only to you — other coaches and athletes cannot see
          them.
        </p>
      </LegalSection>

      <LegalSection title="Information About Minors">
        <p>
          Statline serves student athletes, including users under the age of
          18. We do not knowingly collect personal information from children
          under 13 without verifiable parental consent. If you are a parent
          or guardian and believe your child under 13 has created an account
          or submitted information to us, please contact us and we will
          delete that information.
        </p>
      </LegalSection>

      <LegalSection title="How We Use Information">
        <p>
          We use the information you provide to display your athlete
          profile, generate AI-powered scouting reports, power search and
          leaderboard rankings, and allow coaches to discover and organize
          prospects. We do not sell your personal data to third parties.
        </p>
      </LegalSection>

      <LegalSection title="AI-Generated Content">
        <p>
          Scouting report summaries, taglines, and stat highlights on
          athlete profiles are generated using Anthropic&apos;s Claude AI
          based on the information an athlete submits. This AI-generated
          content may contain inaccuracies and should not be treated as a
          guarantee of athletic ability or of any recruiting outcome.
          Self-reported stats, achievements, and combine numbers are not
          independently verified by Statline unless a profile explicitly
          says otherwise.
        </p>
      </LegalSection>

      <LegalSection title="Data Storage and Security">
        <p>
          We take reasonable technical and organizational measures to
          protect the information stored on Statline. No method of
          transmission or storage is completely secure, and we cannot
          guarantee absolute security of your data.
        </p>
      </LegalSection>

      <LegalSection title="Your Choices">
        <p>
          Athletes can keep their profile private using the publishing
          toggle in the profile builder — a private profile is saved to your
          account but never appears in the public directory, leaderboard, or
          trending sections. You can request deletion of your account and
          associated data at any time by contacting us.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy or a data request can be sent to{" "}
          <a
            href="mailto:statlinework@gmail.com"
            className="text-electric-500 underline underline-offset-2 hover:text-electric-600"
          >
            statlinework@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
