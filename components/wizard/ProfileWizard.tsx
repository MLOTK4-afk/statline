"use client";

import { useEffect, useState } from "react";
import type { AthleteProfile, Level } from "@/lib/types";
import { LEVELS, SPORTS, US_REGIONS } from "@/lib/constants";
import { StepIndicator } from "@/components/wizard/StepIndicator";
import { StatRowsEditor, ListEditor } from "@/components/wizard/ListEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/Field";
import { ProfileFull } from "@/components/profile/ProfileFull";
import { ProfileLivePreview } from "@/components/wizard/ProfileLivePreview";
import { CompletenessMeter } from "@/components/wizard/CompletenessMeter";
import { computeCompleteness } from "@/lib/completeness";
import { cn } from "@/lib/cn";

const STEPS = ["Level", "Sport", "Details"];

export function ProfileWizard() {
  const [step, setStep] = useState(1);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [sport, setSport] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [region, setRegion] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [heightWeight, setHeightWeight] = useState("");
  const [positions, setPositions] = useState("");
  const [gpa, setGpa] = useState("");
  const [statRows, setStatRows] = useState([{ label: "", value: "" }]);
  const [highlightUrl, setHighlightUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<string[]>([""]);
  const [previousSeasonStats, setPreviousSeasonStats] = useState("");
  const [combineRows, setCombineRows] = useState([{ label: "", value: "" }]);
  const [endorsementName, setEndorsementName] = useState("");
  const [endorsementTitle, setEndorsementTitle] = useState("");
  const [endorsementQuote, setEndorsementQuote] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [committed, setCommitted] = useState(false);
  const [committedSchool, setCommittedSchool] = useState("");
  const [published, setPublished] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "generating" | "done">(
    "idle"
  );
  const [result, setResult] = useState<AthleteProfile | null>(null);

  // Restore an existing profile so returning athletes edit rather than
  // create a duplicate — including the publishing toggle's saved state.
  useEffect(() => {
    fetch("/api/athletes/mine")
      .then((res) => (res.ok ? res.json() : null))
      .then((athlete: AthleteProfile | null) => {
        if (!athlete) return;
        setExistingId(athlete.id);
        setLevel(athlete.level);
        setSport(athlete.sport);
        setName(athlete.name);
        setJerseyNumber(athlete.jerseyNumber ?? "");
        setRegion(athlete.region);
        setGradYear(athlete.gradYear ?? "");
        setHeightWeight(athlete.heightWeight ?? "");
        setPositions(athlete.positions ?? "");
        setGpa(athlete.gpa ?? "");
        const rows = Object.entries(athlete.stats).map(([label, value]) => ({
          label,
          value,
        }));
        setStatRows(rows.length ? rows : [{ label: "", value: "" }]);
        setHighlightUrl(athlete.highlightUrl ?? "");
        setBannerPreviewUrl(athlete.bannerUrl ?? null);
        setAchievements(
          athlete.achievements.length ? athlete.achievements : [""]
        );
        setPreviousSeasonStats(athlete.previousSeasonStats ?? "");
        const combine = (athlete.combine ?? []).map((c) => ({ ...c }));
        setCombineRows(combine.length ? combine : [{ label: "", value: "" }]);
        setEndorsementName(athlete.endorsement?.name ?? "");
        setEndorsementTitle(athlete.endorsement?.title ?? "");
        setEndorsementQuote(athlete.endorsement?.quote ?? "");
        setContactEmail(athlete.contactEmail);
        setContactPhone(athlete.contactPhone ?? "");
        setCommitted(athlete.committed);
        setCommittedSchool(athlete.committedSchool ?? "");
        setPublished(athlete.published);
      })
      .catch(() => {});
  }, []);

  const completeness = computeCompleteness({
    name,
    sport,
    level,
    region,
    hasStats: statRows.some((r) => r.label.trim() && r.value.trim()),
    highlightUrl,
    achievements,
    contactEmail,
    endorsementQuote,
  });

  const BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const BANNER_MAX_BYTES = 5 * 1024 * 1024;

  function handleBannerSelect(file: File | null) {
    setBannerError(null);
    if (!file) return;
    if (!BANNER_TYPES.includes(file.type)) {
      setBannerError("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > BANNER_MAX_BYTES) {
      setBannerError("Image is too large (5MB max).");
      return;
    }
    setBannerFile(file);
    setBannerPreviewUrl(URL.createObjectURL(file));
  }

  async function uploadBannerIfStaged(athleteId: string) {
    if (!bannerFile) return null;
    const formData = new FormData();
    formData.append("file", bannerFile);
    const res = await fetch(`/api/athletes/${athleteId}/banner`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      setBannerError("Profile saved, but the banner upload failed.");
      return null;
    }
    return (await res.json()) as AthleteProfile;
  }

  async function handleSubmit() {
    setError(null);
    if (!name || !region || !contactEmail) {
      setError("Name, region, and contact email are required.");
      return;
    }

    setStatus("saving");
    const stats: Record<string, string> = {};
    statRows.forEach((row) => {
      if (row.label.trim()) stats[row.label.trim()] = row.value.trim();
    });
    const combine = combineRows
      .filter((row) => row.label.trim())
      .map((row) => ({ label: row.label.trim(), value: row.value.trim() }));
    const endorsement =
      endorsementName.trim() && endorsementQuote.trim()
        ? {
            name: endorsementName.trim(),
            title: endorsementTitle.trim(),
            quote: endorsementQuote.trim(),
          }
        : undefined;

    const payload = {
      level,
      sport,
      name,
      jerseyNumber: jerseyNumber || undefined,
      region,
      gradYear: gradYear || undefined,
      heightWeight: heightWeight || undefined,
      positions: positions || undefined,
      gpa: gpa || undefined,
      stats,
      highlightUrl: highlightUrl || undefined,
      achievements: achievements.filter((a) => a.trim()),
      previousSeasonStats: previousSeasonStats || undefined,
      combine: combine.length ? combine : undefined,
      endorsement,
      contactEmail,
      contactPhone: contactPhone || undefined,
      committed,
      committedSchool: committed ? committedSchool || undefined : undefined,
      published,
      isInternational: false,
    };

    try {
      const createRes = await fetch(
        existingId ? `/api/athletes/${existingId}` : "/api/athletes",
        {
          method: existingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error ?? "Failed to save profile.");
      }
      const athlete: AthleteProfile = await createRes.json();

      setStatus("generating");
      const reportRes = await fetch("/api/scouting-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId: athlete.id }),
      });

      if (!reportRes.ok) {
        const data = await reportRes.json();
        const withBanner = await uploadBannerIfStaged(athlete.id);
        setResult(withBanner ?? athlete);
        setStatus("done");
        setError(
          `Profile saved, but the AI scouting report could not be generated: ${data.error ?? "unknown error"}`
        );
        return;
      }

      const updated: AthleteProfile = await reportRes.json();
      const withBanner = await uploadBannerIfStaged(updated.id);
      setResult(withBanner ?? updated);
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
          Your Profile is Live
        </h1>
        {error && (
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-amber-400">
            {error}
          </p>
        )}
        <div className="mt-8">
          <ProfileFull athlete={result} />
        </div>
      </div>
    );
  }

  const livePreviewData = {
    name,
    sport,
    level,
    positions,
    jerseyNumber,
    region,
    statRows,
    highlightUrl,
    achievements,
    combineFilled: combineRows.some((r) => r.label.trim()),
    endorsementQuote,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <StepIndicator steps={STEPS} current={step} />
      {existingId && (
        <p className="mt-4 text-center text-sm text-skyline-300">
          You already have a profile — saving will update it.
        </p>
      )}

      <div className={cn("mt-10 gap-8", step === 3 && "lg:grid lg:grid-cols-5")}>
        <Card className={cn("p-8", step === 3 && "lg:col-span-3")}>
          {step === 1 && (
            <div>
              <h2 className="text-2xl text-white">Select your level</h2>
              <p className="mt-1 text-sm text-slate-400">
                This determines what coaches and scouts see first.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {LEVELS.map((l) => (
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
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SPORTS.map((s) => (
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

              <div className="mt-5">
                <CompletenessMeter
                  percent={completeness.percent}
                  missing={completeness.missing}
                />
              </div>

              <label className="mt-6 flex items-start gap-3 rounded-lg border border-electric-500/30 bg-electric-500/5 p-4">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5"
                />
                <span className="text-sm text-slate-200">
                  List my profile in the public directory so coaches can find
                  me (uncheck to keep it private — only visible to you).
                </span>
              </label>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" required>
                    Full Name
                  </Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="jerseyNumber">Jersey Number</Label>
                  <Input
                    id="jerseyNumber"
                    inputMode="numeric"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="region" required>
                    Region
                  </Label>
                  <Select
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="">Select a region</option>
                    {US_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
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
                    placeholder="6'2&quot; / 190 lbs"
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
                  <Label htmlFor="gpa">GPA</Label>
                  <Input id="gpa" value={gpa} onChange={(e) => setGpa(e.target.value)} />
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
                <Label htmlFor="banner">Profile Banner</Label>
                <p className="mb-2 text-xs text-slate-500">
                  A wide photo shown at the top of your profile. JPG, PNG, or
                  WebP, 5MB max.
                </p>
                {bannerPreviewUrl && (
                  <div
                    className="mb-3 h-32 w-full rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${bannerPreviewUrl})` }}
                  />
                )}
                <input
                  id="banner"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleBannerSelect(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-electric-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-electric-600"
                />
                {bannerError && <FieldError>{bannerError}</FieldError>}
              </div>

              <div className="mt-6">
                <Label>Achievements</Label>
                <ListEditor
                  values={achievements}
                  onChange={setAchievements}
                  placeholder="All-State First Team, 2025"
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="previousSeasonStats">
                  Previous Season Stats
                </Label>
                <Textarea
                  id="previousSeasonStats"
                  rows={3}
                  placeholder="Junior year: 890 rush yards, 9 TDs, 4.9 YPC"
                  value={previousSeasonStats}
                  onChange={(e) => setPreviousSeasonStats(e.target.value)}
                />
              </div>

              <div className="mt-6">
                <Label>Combine Numbers (self-reported)</Label>
                <StatRowsEditor rows={combineRows} onChange={setCombineRows} />
              </div>

              <div className="mt-6">
                <Label>Coach Endorsement (optional)</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Coach name"
                    value={endorsementName}
                    onChange={(e) => setEndorsementName(e.target.value)}
                  />
                  <Input
                    placeholder="Role, e.g. Head Coach, Example High School"
                    value={endorsementTitle}
                    onChange={(e) => setEndorsementTitle(e.target.value)}
                  />
                </div>
                <Textarea
                  className="mt-3"
                  rows={2}
                  placeholder="Endorsement quote"
                  value={endorsementQuote}
                  onChange={(e) => setEndorsementQuote(e.target.value)}
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
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <input
                  id="committed"
                  type="checkbox"
                  checked={committed}
                  onChange={(e) => setCommitted(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
                <label htmlFor="committed" className="text-sm text-slate-300">
                  I am already committed to a school
                </label>
              </div>
              {committed && (
                <div className="mt-3">
                  <Input
                    placeholder="Committed school"
                    value={committedSchool}
                    onChange={(e) => setCommittedSchool(e.target.value)}
                  />
                </div>
              )}

              <div className="mt-6 lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowMobilePreview((v) => !v)}
                  className="text-sm font-semibold text-electric-500 hover:text-electric-600"
                >
                  {showMobilePreview ? "Hide preview" : "Show preview"}
                </button>
                {showMobilePreview && (
                  <div className="mt-4">
                    <ProfileLivePreview data={livePreviewData} />
                  </div>
                )}
              </div>

              <FieldError>{error}</FieldError>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={status !== "idle"}>
                  {status === "saving" && "Saving Profile..."}
                  {status === "generating" && "Generating AI Scouting Report..."}
                  {status === "idle" && (existingId ? "Save Profile" : "Build My Profile")}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {step === 3 && (
          <div className="mt-8 hidden lg:col-span-2 lg:mt-0 lg:block">
            <ProfileLivePreview data={livePreviewData} />
          </div>
        )}
      </div>
    </div>
  );
}
