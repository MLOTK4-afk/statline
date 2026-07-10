import Link from "next/link";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
        <Link
          href="/"
          className="text-sm font-medium text-electric-500 underline underline-offset-2 hover:text-electric-600"
        >
          &larr; Back to home
        </Link>
        <h1 className="mt-6 font-heading text-4xl normal-case text-electric-500">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>
        <div className="mt-10 space-y-9">{children}</div>
      </div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl normal-case text-navy-900">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}
