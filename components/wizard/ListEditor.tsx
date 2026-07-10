"use client";

import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ListEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {values.map((value, idx) => (
        <div key={idx} className="flex gap-2">
          <Input
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...values];
              next[idx] = e.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(values.filter((_, i) => i !== idx))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange([...values, ""])}
      >
        + Add another
      </Button>
    </div>
  );
}

export function StatRowsEditor({
  rows,
  onChange,
}: {
  rows: { label: string; value: string }[];
  onChange: (next: { label: string; value: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      {rows.map((row, idx) => (
        <div key={idx} className="flex gap-2">
          <Input
            placeholder="Stat name (e.g. 40-yard dash)"
            value={row.label}
            onChange={(e) => {
              const next = [...rows];
              next[idx] = { ...next[idx], label: e.target.value };
              onChange(next);
            }}
          />
          <Input
            placeholder="Value (e.g. 4.5s)"
            value={row.value}
            onChange={(e) => {
              const next = [...rows];
              next[idx] = { ...next[idx], value: e.target.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(rows.filter((_, i) => i !== idx))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange([...rows, { label: "", value: "" }])}
      >
        + Add stat
      </Button>
    </div>
  );
}
