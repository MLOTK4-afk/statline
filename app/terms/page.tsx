import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service | Statline",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="June 2026">
      <LegalSection title="Acceptance of Terms">
        <p>
          By creating an account or using Statline, you agree to these
          Terms of Service. If you are under 18, a parent or guardian should
          review these terms with you before you use the platform.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          You are responsible for maintaining the security of your account
          and for all activity that happens under it. You agree to provide
          accurate information when creating your account and building your
          profile.
        </p>
      </LegalSection>

      <LegalSection title="User-Submitted Content">
        <p>
          You retain ownership of the content you submit to Statline —
          stats, achievements, video links, and anything else on your
          profile. If you choose to publish your profile, you grant
          Statline a license to display that content on the platform for
          the purpose of recruiting discovery.
        </p>
      </LegalSection>

      <LegalSection title="No Guarantee of Recruiting Outcomes">
        <p>
          Statline is a tool to help athletes present their information and
          help coaches discover prospects. It is not a guarantee that any
          coach will contact you, offer you a spot, or otherwise recruit
          you. AI-generated summaries may contain errors, and self-reported
          stats are not independently verified.
        </p>
      </LegalSection>

      <LegalSection title="Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Submit false or misleading information on a profile.</li>
          <li>Impersonate another person, athlete, or coach.</li>
          <li>Harass, threaten, or abuse other users.</li>
          <li>Use the platform for any unlawful purpose.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Disclaimer and Limitation of Liability">
        <p>
          Statline is provided &ldquo;as is&rdquo; without warranties of any
          kind, express or implied. To the fullest extent permitted by law,
          Statline is not liable for any damages arising from your use of, or
          inability to use, the platform.
        </p>
      </LegalSection>

      <LegalSection title="Changes to These Terms">
        <p>
          We may update these Terms of Service at any time. Continued use of
          Statline after a change is posted constitutes acceptance of the
          updated terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms can be sent to{" "}
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
