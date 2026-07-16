"use client";

import { SPORTS } from "@/lib/constants";
import { StatRowsEditor } from "@/components/wizard/ListEditor";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";

export const MAX_ADDITIONAL_SPORTS = 2;

export interface AdditionalSportDraft {
  sport: string;
  positions: string;
  jerseyNumber: string;
  statRows: { label: string; value: string }[];
  highlightUrl: string;
}

export const EMPTY_ADDITIONAL_SPORT: AdditionalSportDraft = {
  sport: "",
  positions: "",
  jerseyNumber: "",
  statRows: [{ label: "", value: "" }],
  highlightUrl: "",
};

/**
 * Lets an athlete add up to MAX_ADDITIONAL_SPORTS more sports beyond their
 * primary one (3 total) -- each with its own positions/jersey/stats/film,
 * mirroring the primary sport's fields in Step 3. Capped rather than an
 * unbounded ListEditor-style "+ Add another" since a 4th+ sport isn't
 * supported by the Statline Legend tier or the player card layout.
 */
export function AdditionalSportsEditor({
  sports,
  onChange,
}: {
  sports: AdditionalSportDraft[];
  onChange: (next: AdditionalSportDraft[]) => void;
}) {
  function updateEntry(idx: number, patch: Partial<AdditionalSportDraft>) {
    const next = [...sports];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-5">
      {sports.map((entry, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">
              Sport {idx + 2}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(sports.filter((_, i) => i !== idx))}
            >
              Remove
            </Button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor={`additional-sport-${idx}`} required>
                Sport
              </Label>
              <Select
                id={`additional-sport-${idx}`}
                value={entry.sport}
                onChange={(e) => updateEntry(idx, { sport: e.target.value })}
              >
                <option value="">Select a sport</option>
                {SPORTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor={`additional-jersey-${idx}`}>Jersey Number</Label>
              <Input
                id={`additional-jersey-${idx}`}
                inputMode="numeric"
                value={entry.jerseyNumber}
                onChange={(e) => updateEntry(idx, { jerseyNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`additional-positions-${idx}`}>Position(s)</Label>
              <Input
                id={`additional-positions-${idx}`}
                value={entry.positions}
                onChange={(e) => updateEntry(idx, { positions: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`additional-highlight-${idx}`}>
                Highlight Film Link
              </Label>
              <Input
                id={`additional-highlight-${idx}`}
                placeholder="https://youtube.com/..."
                value={entry.highlightUrl}
                onChange={(e) => updateEntry(idx, { highlightUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>Stats</Label>
            <StatRowsEditor
              rows={entry.statRows}
              onChange={(rows) => updateEntry(idx, { statRows: rows })}
            />
          </div>
        </div>
      ))}

      {sports.length < MAX_ADDITIONAL_SPORTS && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...sports, { ...EMPTY_ADDITIONAL_SPORT }])}
        >
          + Add another sport
        </Button>
      )}
    </div>
  );
}
