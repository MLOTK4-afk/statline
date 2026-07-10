import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { IntlSubNav } from "@/components/international/IntlSubNav";

export default function InternationalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <IntlSubNav />
      {children}
    </LanguageProvider>
  );
}
