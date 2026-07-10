"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type {
  ProgramDivision,
  ProgramStage,
  RecruitingBoard,
  RecruitingProgram,
} from "@/lib/types";
import { BOARD_COLUMNS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/ToastContext";

const DIVISIONS: ProgramDivision[] = ["D1", "D2", "D3", "NAIA", "JUCO"];

const emptyForm = {
  schoolName: "",
  division: "D1" as ProgramDivision,
  coachName: "",
  coachEmail: "",
  notes: "",
};

export function RecruitingBoardContent() {
  const { status } = useSession();
  const [board, setBoard] = useState<RecruitingBoard | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/recruiting-board")
      .then((res) => (res.ok ? res.json() : null))
      .then(setBoard)
      .catch(() => setBoard(null));
  }, [status]);

  if (status === "loading") {
    return <p className="text-slate-500">Loading...</p>;
  }

  if (status !== "authenticated") {
    return (
      <EmptyState
        title="Sign in to track your recruiting outreach"
        description="Create a free account to build a board of U.S. programs you're targeting."
        action={<LinkButton href="/login">Sign In</LinkButton>}
      />
    );
  }

  if (!board) {
    return <p className="text-slate-500">Loading your recruiting board...</p>;
  }

  const byStage = (stage: ProgramStage) =>
    board.programs.filter((p) => p.stage === stage);

  async function updateProgram(id: string, data: Partial<RecruitingProgram>) {
    const res = await fetch(`/api/recruiting-board/programs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setBoard(await res.json());
  }

  async function removeProgram(id: string) {
    const res = await fetch(`/api/recruiting-board/programs/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setBoard(await res.json());
  }

  async function addProgram(e: React.FormEvent) {
    e.preventDefault();
    if (!form.schoolName.trim()) return;
    const res = await fetch("/api/recruiting-board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setBoard(await res.json());
      setForm(emptyForm);
      setShowForm(false);
      showToast("Program added to your recruiting board");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">My Recruiting Board</h1>
          <p className="mt-1 text-slate-400">
            Track your outreach to U.S. college programs.
          </p>
        </div>
        <Button variant="accent" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Program"}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BOARD_COLUMNS.map((col) => (
          <div
            key={col.key}
            className="rounded-lg border border-white/10 bg-white/5 p-4 text-center"
          >
            <div className="font-heading text-2xl text-white">
              {byStage(col.key as ProgramStage).length}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
              {col.label}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form
          onSubmit={addProgram}
          className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2"
        >
          <div>
            <Label required>School Name</Label>
            <Input
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label required>Division</Label>
            <Select
              value={form.division}
              onChange={(e) =>
                setForm({ ...form, division: e.target.value as ProgramDivision })
              }
            >
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Coach Name</Label>
            <Input
              value={form.coachName}
              onChange={(e) => setForm({ ...form, coachName: e.target.value })}
            />
          </div>
          <div>
            <Label>Coach Email</Label>
            <Input
              type="email"
              value={form.coachEmail}
              onChange={(e) => setForm({ ...form, coachEmail: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="accent">
              Add Program
            </Button>
          </div>
        </form>
      )}

      {board.programs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your recruiting board is empty"
            description="Add U.S. programs you're targeting to start tracking outreach."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BOARD_COLUMNS.map((col) => (
            <div
              key={col.key}
              className="flex min-h-[200px] flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="font-heading text-sm uppercase tracking-wider text-slate-300">
                  {col.label}
                </h3>
                <span className="text-xs text-slate-500">
                  {byStage(col.key as ProgramStage).length}
                </span>
              </div>

              {byStage(col.key as ProgramStage).map((program) => (
                <div
                  key={program.id}
                  className="rounded-lg border border-white/10 bg-navy-900 p-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading text-base text-white">
                      {program.schoolName}
                    </p>
                    <span className="rounded-full border border-intl-300/40 px-2 py-0.5 text-xs text-intl-300">
                      {program.division}
                    </span>
                  </div>
                  {(program.coachName || program.coachEmail) && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {program.coachName}
                      {program.coachName && program.coachEmail ? " · " : ""}
                      {program.coachEmail}
                    </p>
                  )}
                  {program.notes && (
                    <p className="mt-2 line-clamp-2 rounded bg-white/5 px-2 py-1 text-xs text-slate-400">
                      {program.notes}
                    </p>
                  )}

                  <div className="mt-2">
                    <Select
                      value={program.stage}
                      onChange={(e) =>
                        updateProgram(program.id, {
                          stage: e.target.value as ProgramStage,
                        })
                      }
                      className="!py-1 text-xs"
                    >
                      {BOARD_COLUMNS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeProgram(program.id)}
                      className="text-xs text-slate-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
