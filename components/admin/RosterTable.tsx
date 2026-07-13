"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BoardColumnKey } from "@/lib/types";
import { BOARD_COLUMNS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/lib/toast/ToastContext";

export interface RosterRow {
  id: string;
  name: string;
  sport: string;
  gradYear: string;
  completionPercent: number;
  lastActivity: string;
  outreachStatus: BoardColumnKey | null;
  committed: boolean;
  contactEmail: string;
}

type SortKey = keyof Pick<
  RosterRow,
  "name" | "sport" | "gradYear" | "completionPercent" | "lastActivity" | "committed"
>;

type CompletionFilter = "" | "complete" | "incomplete" | "not-started";

const OUTREACH_LABEL: Record<BoardColumnKey, string> = Object.fromEntries(
  BOARD_COLUMNS.map((c) => [c.key, c.label])
) as Record<BoardColumnKey, string>;

function completionBucket(percent: number): Exclude<CompletionFilter, ""> {
  if (percent >= 100) return "complete";
  if (percent === 0) return "not-started";
  return "incomplete";
}

function toCsv(rows: RosterRow[]): string {
  const header = [
    "Name",
    "Sport",
    "Grad Year",
    "Completion %",
    "Last Activity",
    "Outreach Status",
    "Committed",
  ];
  const lines = rows.map((r) =>
    [
      r.name,
      r.sport,
      r.gradYear,
      r.completionPercent,
      new Date(r.lastActivity).toISOString(),
      r.outreachStatus ? OUTREACH_LABEL[r.outreachStatus] : "Not in pipeline",
      r.committed ? "Yes" : "No",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function RosterTable({ rows }: { rows: RosterRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [sportFilter, setSportFilter] = useState("");
  const [gradYearFilter, setGradYearFilter] = useState("");
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const sports = useMemo(
    () => Array.from(new Set(rows.map((r) => r.sport))).sort(),
    [rows]
  );
  const gradYears = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.gradYear).filter((y) => y !== "—"))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (sportFilter && r.sport !== sportFilter) return false;
      if (gradYearFilter && r.gradYear !== gradYearFilter) return false;
      if (completionFilter && completionBucket(r.completionPercent) !== completionFilter)
        return false;
      return true;
    });
  }, [rows, sportFilter, gradYearFilter, completionFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === sorted.length ? new Set() : new Set(sorted.map((r) => r.id))
    );
  }

  async function sendReminders() {
    const targets = sorted.filter(
      (r) => selected.has(r.id) && r.completionPercent < 100
    );
    if (targets.length === 0) {
      showToast("No selected athletes have an incomplete profile");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/roster/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteIds: targets.map((r) => r.id) }),
      });
      if (res.ok) {
        showToast(
          `Logged a reminder for ${targets.length} athlete${targets.length === 1 ? "" : "s"} — no email/push system is connected yet, so nothing was actually sent.`
        );
      } else {
        showToast("Failed to log reminders");
      }
    } finally {
      setSending(false);
    }
  }

  function exportCsv() {
    const rowsToExport = selected.size > 0 ? sorted.filter((r) => selected.has(r.id)) : sorted;
    downloadCsv(toCsv(rowsToExport), "statline-roster.csv");
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "sport", label: "Sport" },
    { key: "gradYear", label: "Grad Year" },
    { key: "completionPercent", label: "Completion %" },
    { key: "lastActivity", label: "Last Activity" },
    { key: "committed", label: "Committed" },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
        >
          <option value="">All Sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={gradYearFilter}
          onChange={(e) => setGradYearFilter(e.target.value)}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
        >
          <option value="">All Grad Years</option>
          {gradYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={completionFilter}
          onChange={(e) => setCompletionFilter(e.target.value as CompletionFilter)}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
        >
          <option value="">Any Completion Status</option>
          <option value="complete">Complete</option>
          <option value="incomplete">Incomplete</option>
          <option value="not-started">Not Started</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-sm text-slate-400">
          {selected.size} selected
        </span>
        <button
          type="button"
          onClick={sendReminders}
          disabled={selected.size === 0 || sending}
          className="rounded-md bg-electric-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-electric-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send Reminder
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:border-white/40"
        >
          Export to CSV{selected.size > 0 ? ` (${selected.size})` : " (All)"}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.size > 0 && selected.size === sorted.length}
                  onChange={toggleAll}
                  aria-label="Select all rows"
                />
              </th>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    {col.label}
                    {sortKey === col.key && (sortDir === "asc" ? "↑" : "↓")}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3">Outreach Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sorted.map((row) => (
              <tr
                key={row.id}
                onClick={() => router.push(`/athletes/${row.id}`)}
                className="cursor-pointer hover:bg-white/5"
              >
                <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    aria-label={`Select ${row.name}`}
                  />
                </td>
                <td className="px-4 py-2.5 text-slate-200">{row.name}</td>
                <td className="px-4 py-2.5 text-slate-400">{row.sport}</td>
                <td className="px-4 py-2.5 text-slate-400">{row.gradYear}</td>
                <td className="px-4 py-2.5 text-slate-400">
                  {row.completionPercent}%
                </td>
                <td className="px-4 py-2.5 text-slate-400">
                  {new Date(row.lastActivity).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-slate-400">
                  {row.committed ? (
                    <Badge className="border-electric-500/40 text-electric-500">
                      Committed
                    </Badge>
                  ) : (
                    <Badge>Uncommitted</Badge>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-400">
                  {row.outreachStatus ? (
                    <Badge>{OUTREACH_LABEL[row.outreachStatus]}</Badge>
                  ) : (
                    <span className="text-xs text-slate-600">Not in pipeline</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="p-6 text-sm text-slate-500">
            No athletes match these filters.
          </p>
        )}
      </div>
    </div>
  );
}
