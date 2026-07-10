"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export default function AdminSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (session?.user?.role === "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-3xl text-white">You&apos;re already an admin</h1>
        <p className="mt-2 text-slate-400">
          Head over to the{" "}
          <a href="/admin" className="text-electric-500 underline">
            Admin Dashboard
          </a>
          .
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong.");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-3xl text-white">Admin Setup</h1>
      <p className="mt-2 text-slate-400">
        Enter the server&apos;s <code>ADMIN_SETUP_SECRET</code> to promote
        your account to administrator. This is intended for first-time setup
        only.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          type="password"
          placeholder="Admin setup secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Grant Admin Access"}
        </Button>
      </form>
    </div>
  );
}
