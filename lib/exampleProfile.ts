import type { AthleteProfile } from "@/lib/types";

/**
 * The one hardcoded demo profile used to show visitors what a completed
 * Statline profile looks like. This is never written to the JSON store and
 * never returned by any storage/API call — real listings (browse, trending,
 * spotlight, leaderboard, search) only ever read from the store, so this
 * object can't leak into them by construction. `published: false` and
 * `isExample: true` are extra belt-and-suspenders guards in case any future
 * code merges profile arrays together.
 */
export const EXAMPLE_PROFILE: AthleteProfile = {
  id: "example",
  ownerToken: null,
  level: "high-school",
  sport: "Football",
  name: "Jordan Rivera",
  region: "Southeast",
  positions: "Running Back",
  team: "Example High School",
  gpa: "3.7",
  stats: {
    "Rush Yards": "1,240",
    Touchdowns: "14",
    "40-Yard Dash": "4.6s",
  },
  achievements: [
    "All-Conference, Senior Year",
    "Team Captain",
    "Regional Offensive MVP",
  ],
  // A second sport (Track & Field) so the example profile shows off the
  // multi-sport tab layout -- its own positions/stats/achievements/Fit
  // Score, distinct from football's -- since this is the flagship demo
  // page new users land on. Paired with the existing coach endorsement
  // below, this is what genuinely earns Statline Legend under the current
  // tier rule (Elite-level profile + more than one sport), not an override.
  additionalSports: [
    {
      sport: "Track & Field",
      positions: "100m, 200m, 4x100m Relay",
      stats: {
        "100m": "11.1s",
        "200m": "22.8s",
      },
      achievements: [
        "Regional Qualifier, 100m",
        "Conference Champion, 4x100m Relay",
      ],
    },
  ],
  contactEmail: "",
  committed: false,
  published: false,
  isInternational: false,
  isExample: true,
  scoutingReport: {
    tagline: "Explosive downhill runner with vision",
    summary:
      "Jordan Rivera is a decisive downhill runner who presses the line of scrimmage before making one cut and accelerating through the hole. Contact balance and second-effort yardage stand out on tape, and production held up against the toughest conference schedule on the team's slate.",
    strengths: [
      "One-cut decisiveness",
      "Contact balance through the hole",
      "Home-run speed once in the open field",
      "Reliable pass protection for the position",
    ],
    statCards: [
      { label: "Rush Yards", value: "1,240" },
      { label: "Touchdowns", value: "14" },
      { label: "40-Yard Dash", value: "4.6s" },
      { label: "GPA", value: "3.7" },
    ],
    generatedAt: "2026-01-01T00:00:00.000Z",
  },
  combine: [
    { label: "40-Yard Dash", value: "4.58s" },
    { label: "Vertical Jump", value: "34 in" },
    { label: "Bench (225 lbs)", value: "8 reps" },
  ],
  combineVerified: false,
  endorsement: {
    name: "Coach T. Hendricks",
    title: "Head Coach, Example High School",
    quote: "This is what a strong coach endorsement looks like on a Statline profile.",
  },
  previousSeasonStats: "Junior year: 890 rush yards, 9 TDs, 4.9 YPC",
  targetSchools: ["State University", "Coastal Tech", "Valley College"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
