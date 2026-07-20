export type Level = "youth" | "high-school" | "college" | "independent";

export type Division = "D1" | "D2" | "D3" | "NAIA";

/**
 * Deterministic, completeness/engagement-based tier — computed by
 * lib/tier.ts, not stored. "Elite" displays as "Statline Elite" and
 * "Legend" displays as "Statline Legend".
 */
export type Tier = "Bronze" | "Silver" | "Gold" | "Elite" | "Legend";

export type Language = "en" | "pt" | "es" | "fr";

export interface StatCard {
  label: string;
  value: string;
}

/**
 * One additional sport beyond an athlete's primary `sport` — captures only
 * the fields that genuinely vary by sport (positions, jersey, stats,
 * highlight film). Person-level fields (name, GPA, region, achievements,
 * endorsement, etc.) stay shared across all of an athlete's sports.
 */
export interface SportEntry {
  sport: string;
  positions?: string;
  jerseyNumber?: string;
  stats?: Record<string, string>;
  highlightUrl?: string;
}

export interface ScoutingReport {
  tagline: string;
  summary: string;
  strengths: string[];
  statCards: StatCard[];
  generatedAt: string;
}

export interface DivisionMatch {
  division: Division;
  confidence: "Low" | "Moderate" | "High";
  reasoning: string;
  generatedAt: string;
}

export interface AthleteProfile {
  id: string;
  /**
   * Anonymous device-token identity of whoever created this profile — the
   * app allows anonymous form submission, so this is not a real user id.
   */
  ownerToken: string | null;
  level: Level;
  sport: string;
  /** Up to 2 additional sports (3 total including the primary `sport`). */
  additionalSports?: SportEntry[];
  name: string;
  jerseyNumber?: string;
  region: string;
  gradYear?: string;
  heightWeight?: string;
  positions?: string;
  gpa?: string;
  stats: Record<string, string>;
  highlightUrl?: string;
  /** Public URL of an uploaded profile banner image (Supabase Storage). */
  bannerUrl?: string;
  achievements: string[];
  contactEmail: string;
  contactPhone?: string;
  committed: boolean;
  committedSchool?: string;
  published: boolean;
  isInternational: boolean;
  international?: {
    homeCountry: string;
    clubOrAcademy?: string;
    eligibilityStatus?: string;
    homeCountryGpa?: string;
    convertedGpa?: string;
    englishProficiency?: string;
    entryYear?: string;
  };
  scoutingReport?: ScoutingReport;
  divisionMatch?: DivisionMatch;
  createdAt: string;
  updatedAt: string;
  /** Current school/club team name, distinct from a college commitment. */
  team?: string;
  /** Combine/testing numbers, rendered the same way as AI stat cards. */
  combine?: StatCard[];
  /** True only if a Statline admin has verified the combine numbers. */
  combineVerified?: boolean;
  endorsement?: {
    name: string;
    title: string;
    quote: string;
  };
  /** Free-text season-by-season stats the athlete pastes in themselves. */
  previousSeasonStats?: string;
  /** College programs this athlete is targeting. */
  targetSchools?: string[];
  /** Incremented on each real (non-example) profile view. */
  viewCount?: number;
  /**
   * Marks the single hardcoded demo profile used to show visitors what a
   * completed Statline profile looks like. Never set by real data paths —
   * the example profile is never written to the store, so this flag is
   * mostly a belt-and-suspenders guard for any code that merges profile
   * lists together.
   */
  isExample?: boolean;
  /**
   * Legacy override for the multi-sport Legend tier -- set once via a
   * one-time backfill for athletes who already held Legend under the old
   * "just add a second sport" rule, so tightening the rule later doesn't
   * retroactively demote them. Read-only from the app's perspective: never
   * mapped in athleteToRow, so it can't be set through the public athlete
   * PATCH endpoint. See lib/tier.ts.
   */
  legendGrandfathered?: boolean;
}

export type Role = "athlete" | "coach" | "admin";

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, string>;
  createdAt: string;
}

/**
 * Backs NextAuth admin login only (kept on local JSON storage, never
 * migrated to Postgres — see lib/storage/index.ts). Regular visitors never
 * have one of these; their starred/followed athletes, boards, and saved
 * searches are all keyed by an anonymous device token instead.
 */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export type BoardColumnKey =
  | "toContact"
  | "contacted"
  | "replied"
  | "offerReceived";

export interface BoardCard {
  athleteId: string;
  note?: string;
  addedAt: string;
}

export interface ScoutingBoard {
  id: string;
  ownerToken: string;
  name: string;
  isDefault?: boolean;
  /** Present once a coach generates a read-only share link for this board. */
  shareToken?: string;
  columns: Record<BoardColumnKey, BoardCard[]>;
  createdAt: string;
  updatedAt: string;
}

export type ProgramDivision = "D1" | "D2" | "D3" | "NAIA" | "JUCO";
export type ProgramStage =
  | "toContact"
  | "contacted"
  | "replied"
  | "offerReceived";

export interface RecruitingProgram {
  id: string;
  schoolName: string;
  division: ProgramDivision;
  coachName?: string;
  coachEmail?: string;
  notes?: string;
  stage: ProgramStage;
  addedAt: string;
}

export interface RecruitingBoard {
  ownerToken: string;
  programs: RecruitingProgram[];
  updatedAt: string;
}

export interface AnalyticsEvent {
  type: string;
  ts: string;
  meta?: Record<string, string>;
}

/**
 * A single entry in an athlete's Activity Log timeline. Assembled by
 * store.getActivityTimeline() from existing tables (analytics_events,
 * stars, board_cards) -- there is no separate activity_log table, so this
 * always reads the same source of truth those other features use. Never
 * carries a coach's owner_token; the app never associates outreach actions
 * with a real coach identity, so there's nothing to redact beyond that.
 */
export interface ActivityEvent {
  type:
    | "profile_viewed"
    | "profile_built"
    | "profile_updated"
    | "starred"
    | "added_to_board";
  ts: string;
  detail?: string;
}

export interface AnalyticsData {
  pageViews: number;
  profileViews: number;
  signups: number;
  profilesBuilt: number;
  events: AnalyticsEvent[];
}
