"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/lib/toast/ToastContext";

export function TargetSchoolsEditor({
  athleteId,
  initialSchools,
}: {
  athleteId: string;
  initialSchools: string[];
}) {
  const [schools, setSchools] = useState(initialSchools);
  const [newSchool, setNewSchool] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function save(next: string[]) {
    setSaving(true);
    const res = await fetch(`/api/athletes/${athleteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetSchools: next }),
    });
    if (res.ok) {
      setSchools(next);
      showToast("Profile updated");
    }
    setSaving(false);
  }

  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-5">
      <h3 className="text-sm uppercase tracking-wider text-slate-400">
        Manage Target Schools
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {schools.map((school) => (
          <Badge key={school} className="gap-1.5">
            {school}
            <button
              type="button"
              onClick={() => save(schools.filter((s) => s !== school))}
              className="text-slate-500 hover:text-red-400"
              aria-label={`Remove ${school}`}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newSchool.trim() && !schools.includes(newSchool.trim())) {
            save([...schools, newSchool.trim()]);
            setNewSchool("");
          }
        }}
        className="mt-3 flex gap-2"
      >
        <Input
          placeholder="Add a school"
          value={newSchool}
          onChange={(e) => setNewSchool(e.target.value)}
        />
        <Button type="submit" size="sm" disabled={saving}>
          Add
        </Button>
      </form>
    </div>
  );
}
