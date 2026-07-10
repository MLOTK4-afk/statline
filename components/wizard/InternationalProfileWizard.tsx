"use client";

import { useState } from "react";
import type { AthleteProfile, Level } from "@/lib/types";
import {
  LEVELS,
  INTERNATIONAL_SPORTS,
  COUNTRIES,
  ENGLISH_PROFICIENCY_LEVELS,
  ELIGIBILITY_STATUSES,
} from "@/lib/constants";
import { StepIndicator } from "@/components/wizard/StepIndicator";
import { StatRowsEditor, ListEditor } from "@/components/wizard/ListEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, FieldError } from "@/components/ui/Field";
import { ProfileFull } from "@/components/profile/ProfileFull";
import { cn } from "@/lib/cn";

const STEPS = ["Level", "Sport", "Details"];

export function InternationalProfileWizard() {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<Level | null>(null);
  const [sport, setSport] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [homeCountry, setHomeCountry] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [heightWeight, setHeightWeight] = useState("");
  const [positions, setPositions] = useState("");
  const [clubOrAcademy, setClubOrAcademy] = useState("");
  const [eligibilityStatus, setEligibilityStatus] = useState("");
  const [homeCountryGpa, setHomeCountryGpa] = useState("");
  const [convertedGpa, setConvertedGpa] = useState("");
  const [englishProficiency, setEnglishProficiency] = useState("");
  const [statRows, setStatRows] = useState([{ label: "", value: "" }]);
  const [highlightUrl, setHighlightUrl] = useState("");
  const [achievements, setAchievements] = useState<string[]>([""]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "saving" | "scouting" | "matching" | "done"
  >("idle");
  const [result, setResult] = useState<AthleteProfile | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!name || !homeCountry || !contactEmail) {
      setError("Name, home country, and contact email are required.");
      return;
    }

    setStatus("saving");
    const stats: Record<string, string> = {};
    statRows.forEach((row) => {
      if (row.label.trim()) stats[row.label.trim()] = row.value.trim();
    });

    try {
      const createRes = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          sport,
          name,
          region: homeCountry,
          gradYear: gradYear || undefined,
          heightWeight: heightWeight || undefined,
          positions: positions || undefined,
          gpa: convertedGpa || undefined,
          stats,
          highlightUrl: highlightUrl || undefined,
          achievements: achievements.filter((a) => a.trim()),
          contactEmail,
          contactPhone: contactPhone || undefined,
          committed: false,
          published: true,
          isInternational: true,
          international: {
            homeCountry,
            clubOrAcademy: clubOrAcademy || undefined,
            eligibilityStatus: eligibilityStatus || undefined,
            homeCountryGpa: homeCountryGpa || undefined,
            convertedGpa: convertedGpa || undefined,
            englishProficiency: englishProficiency || undefined,
          },
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error ?? "Failed to save profile.");
      }
      let athlete: AthleteProfile = await createRes.json();

      setStatus("scouting");
      const reportRes = await fetch("/api/scouting-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId: athlete.id }),
      });
      if (reportRes.ok) athlete = await reportRes.json();

      setStatus("matching");
      const matchRes = await fetch("/api/division-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId: athlete.id }),
      });
      if (matchRes.ok) athlete = await matchRes.json();

      setResult(athlete);
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-center text-3xl text-white">
          Your International Profile is Live
        </h1>
        <div className="mt-8">
          <ProfileFull athlete={result} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <StepIndicator steps={STEPS} current={step} />

      <Card className="mt-10 p-8">
        {step === 1 && (
          <div>
            <h2 className="text-2xl text-white">Select your level</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {LEVELS.filter((l) => l.value !== "pro").map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(l.value)}
                  className={cn(
                    "rounded-lg border p-5 text-left transition-colors",
                    level === l.value
                      ? "border-electric-500 bg-electric-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  )}
                >
                  <div className="font-heading text-xl text-white">
                    {l.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{l.blurb}</div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button disabled={!level} onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl text-white">Select your sport</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {INTERNATIONAL_SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                    sport === s
                      ? "border-electric-500 bg-electric-500/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button disabled={!sport} onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl text-white">Your details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" required>
                  Full Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="homeCountry" required>
                  Home Country
                </Label>
                <Select
                  id="homeCountry"
                  value={homeCountry}
                  onChange={(e) => setHomeCountry(e.target.value)}
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="gradYear">Graduation Year</Label>
                <Input
                  id="gradYear"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="heightWeight">Height / Weight</Label>
                <Input
                  id="heightWeight"
                  value={heightWeight}
                  onChange={(e) => setHeightWeight(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="positions">Position(s)</Label>
                <Input
                  id="positions"
                  value={positions}
                  onChange={(e) => setPositions(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="clubOrAcademy">Club / Academy</Label>
                <Input
                  id="clubOrAcademy"
                  value={clubOrAcademy}
                  onChange={(e) => setClubOrAcademy(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="eligibilityStatus">NCAA Eligibility Status</Label>
                <Select
                  id="eligibilityStatus"
                  value={eligibilityStatus}
                  onChange={(e) => setEligibilityStatus(e.target.value)}
                >
                  <option value="">Select status</option>
                  {ELIGIBILITY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="englishProficiency">English Proficiency</Label>
                <Select
                  id="englishProficiency"
                  value={englishProficiency}
                  onChange={(e) => setEnglishProficiency(e.target.value)}
                >
                  <option value="">Select level</option>
                  {ENGLISH_PROFICIENCY_LEVELS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="homeCountryGpa">Home Country GPA / Grade</Label>
                <Input
                  id="homeCountryGpa"
                  placeholder="e.g. 8.5 / 10"
                  value={homeCountryGpa}
                  onChange={(e) => setHomeCountryGpa(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="convertedGpa">Converted U.S. GPA (if known)</Label>
                <Input
                  id="convertedGpa"
                  placeholder="e.g. 3.7"
                  value={convertedGpa}
                  onChange={(e) => setConvertedGpa(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <Label>Stats</Label>
              <StatRowsEditor rows={statRows} onChange={setStatRows} />
            </div>

            <div className="mt-6">
              <Label htmlFor="highlightUrl">Highlight Film Link</Label>
              <Input
                id="highlightUrl"
                placeholder="https://youtube.com/..."
                value={highlightUrl}
                onChange={(e) => setHighlightUrl(e.target.value)}
              />
            </div>

            <div className="mt-6">
              <Label>Achievements</Label>
              <ListEditor
                values={achievements}
                onChange={setAchievements}
                placeholder="National champion, U18, 2025"
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactEmail" required>
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone / WhatsApp</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>

            <FieldError>{error}</FieldError>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={status !== "idle"}>
                {status === "saving" && "Saving Profile..."}
                {status === "scouting" && "Generating Scouting Report..."}
                {status === "matching" && "Running AI Division Match..."}
                {status === "idle" && "Build My Profile"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
