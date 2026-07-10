import { v4 as uuid } from "uuid";
import { readJson, writeJson } from "./fileStore";
import { createClient } from "@/lib/supabase/server";
import type {
  AnalyticsEvent,
  AthleteProfile,
  BoardCard,
  BoardColumnKey,
  RecruitingBoard,
  RecruitingProgram,
  SavedSearch,
  ScoutingBoard,
  UserRecord,
} from "@/lib/types";

/**
 * Every route/component talks to data through this interface only.
 *
 * Athletes, boards, recruiting programs, saved searches, stars, follows, and
 * analytics events live in Postgres (Supabase) — the app allows anonymous
 * form submission, so all of these are scoped by an anonymous device-token
 * cookie (`ownerToken`) rather than a real signed-in user id.
 *
 * NextAuth admin accounts (`UserRecord`) are the one exception: they stay on
 * local JSON storage, unrelated to and untouched by the Supabase migration,
 * since admin credentials never need to leave the server and gate exactly
 * one page (/admin).
 */
export interface StatlineStore {
  listAthletes(): Promise<AthleteProfile[]>;
  getAthlete(id: string): Promise<AthleteProfile | null>;
  createAthlete(
    data: Omit<AthleteProfile, "id" | "createdAt" | "updatedAt">
  ): Promise<AthleteProfile>;
  updateAthlete(
    id: string,
    data: Partial<AthleteProfile>
  ): Promise<AthleteProfile | null>;
  deleteAthlete(id: string): Promise<boolean>;

  getUserByEmail(email: string): Promise<UserRecord | null>;
  getUserById(id: string): Promise<UserRecord | null>;
  createUser(
    data: Omit<UserRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<UserRecord>;
  updateUser(id: string, data: Partial<UserRecord>): Promise<UserRecord | null>;

  getFollowerCount(athleteId: string): Promise<number>;
  getStarredAthleteIds(ownerToken: string): Promise<string[]>;
  toggleStar(ownerToken: string, athleteId: string): Promise<string[]>;
  getFollowingIds(ownerToken: string): Promise<string[]>;
  toggleFollow(ownerToken: string, athleteId: string): Promise<string[]>;

  listSavedSearches(ownerToken: string): Promise<SavedSearch[]>;
  addSavedSearch(
    ownerToken: string,
    name: string,
    filters: Record<string, string>
  ): Promise<SavedSearch[]>;
  removeSavedSearch(
    ownerToken: string,
    searchId: string
  ): Promise<SavedSearch[]>;

  listBoardsByOwnerToken(ownerToken: string): Promise<ScoutingBoard[]>;
  getBoardById(boardId: string): Promise<ScoutingBoard | null>;
  getBoardByShareToken(token: string): Promise<ScoutingBoard | null>;
  createBoard(ownerToken: string, name: string): Promise<ScoutingBoard>;
  renameBoard(boardId: string, name: string): Promise<ScoutingBoard | null>;
  deleteBoard(boardId: string): Promise<boolean>;
  setBoardShareEnabled(
    boardId: string,
    enabled: boolean
  ): Promise<ScoutingBoard | null>;
  addAthleteToBoard(
    boardId: string,
    athleteId: string
  ): Promise<ScoutingBoard | null>;
  removeAthleteFromBoard(
    boardId: string,
    athleteId: string
  ): Promise<ScoutingBoard | null>;
  moveBoardCard(
    boardId: string,
    athleteId: string,
    toColumn: BoardColumnKey
  ): Promise<ScoutingBoard | null>;
  moveCardToBoard(
    fromBoardId: string,
    toBoardId: string,
    athleteId: string
  ): Promise<void>;
  updateBoardCardNote(
    boardId: string,
    athleteId: string,
    note: string
  ): Promise<ScoutingBoard | null>;

  getRecruitingBoard(ownerToken: string): Promise<RecruitingBoard>;
  addRecruitingProgram(
    ownerToken: string,
    program: Omit<RecruitingProgram, "id" | "addedAt">
  ): Promise<RecruitingBoard>;
  updateRecruitingProgram(
    ownerToken: string,
    programId: string,
    data: Partial<RecruitingProgram>
  ): Promise<RecruitingBoard>;
  removeRecruitingProgram(
    ownerToken: string,
    programId: string
  ): Promise<RecruitingBoard>;

  recordEvent(type: string, meta?: Record<string, string>): Promise<void>;
  getRecentEvents(types: string[], limit: number): Promise<AnalyticsEvent[]>;
  getAnalyticsSummary(): Promise<{
    pageViews: number;
    profileViews: number;
    signups: number;
    profilesBuilt: number;
    directorySize: number;
    internationalDirectorySize: number;
  }>;
  getEventStats(): Promise<{
    total: number;
    last24h: number;
    last7d: number;
    byType: { type: string; count: number }[];
    recent: AnalyticsEvent[];
  }>;
}

const USERS_FILE = "users";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function emptyColumns(): Record<BoardColumnKey, BoardCard[]> {
  return { toContact: [], contacted: [], replied: [], offerReceived: [] };
}

// ---------------------------------------------------------------------------
// Row <-> domain-object mapping (Postgres is snake_case, TS is camelCase)
// ---------------------------------------------------------------------------

function rowToAthlete(row: any): AthleteProfile {
  return {
    id: row.id,
    ownerToken: row.owner_token,
    level: row.level,
    sport: row.sport,
    name: row.name,
    jerseyNumber: row.jersey_number ?? undefined,
    region: row.region,
    gradYear: row.grad_year ?? undefined,
    heightWeight: row.height_weight ?? undefined,
    positions: row.positions ?? undefined,
    gpa: row.gpa ?? undefined,
    stats: row.stats ?? {},
    highlightUrl: row.highlight_url ?? undefined,
    achievements: row.achievements ?? [],
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone ?? undefined,
    committed: row.committed,
    committedSchool: row.committed_school ?? undefined,
    published: row.published,
    isInternational: row.is_international,
    international: row.international ?? undefined,
    scoutingReport: row.scouting_report ?? undefined,
    divisionMatch: row.division_match ?? undefined,
    team: row.team ?? undefined,
    combine: row.combine ?? undefined,
    combineVerified: row.combine_verified ?? undefined,
    endorsement: row.endorsement ?? undefined,
    previousSeasonStats: row.previous_season_stats ?? undefined,
    targetSchools: row.target_schools ?? undefined,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function athleteToRow(
  data: Partial<AthleteProfile>
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.ownerToken !== undefined) row.owner_token = data.ownerToken;
  if (data.level !== undefined) row.level = data.level;
  if (data.sport !== undefined) row.sport = data.sport;
  if (data.name !== undefined) row.name = data.name;
  if (data.jerseyNumber !== undefined) row.jersey_number = data.jerseyNumber;
  if (data.region !== undefined) row.region = data.region;
  if (data.gradYear !== undefined) row.grad_year = data.gradYear;
  if (data.heightWeight !== undefined) row.height_weight = data.heightWeight;
  if (data.positions !== undefined) row.positions = data.positions;
  if (data.gpa !== undefined) row.gpa = data.gpa;
  if (data.stats !== undefined) row.stats = data.stats;
  if (data.highlightUrl !== undefined) row.highlight_url = data.highlightUrl;
  if (data.achievements !== undefined) row.achievements = data.achievements;
  if (data.contactEmail !== undefined) row.contact_email = data.contactEmail;
  if (data.contactPhone !== undefined) row.contact_phone = data.contactPhone;
  if (data.committed !== undefined) row.committed = data.committed;
  if (data.committedSchool !== undefined)
    row.committed_school = data.committedSchool;
  if (data.published !== undefined) row.published = data.published;
  if (data.isInternational !== undefined)
    row.is_international = data.isInternational;
  if (data.international !== undefined) row.international = data.international;
  if (data.scoutingReport !== undefined)
    row.scouting_report = data.scoutingReport;
  if (data.divisionMatch !== undefined) row.division_match = data.divisionMatch;
  if (data.team !== undefined) row.team = data.team;
  if (data.combine !== undefined) row.combine = data.combine;
  if (data.combineVerified !== undefined)
    row.combine_verified = data.combineVerified;
  if (data.endorsement !== undefined) row.endorsement = data.endorsement;
  if (data.previousSeasonStats !== undefined)
    row.previous_season_stats = data.previousSeasonStats;
  if (data.targetSchools !== undefined) row.target_schools = data.targetSchools;
  if (data.viewCount !== undefined) row.view_count = data.viewCount;
  return row;
}

function rowToBoard(row: any): ScoutingBoard {
  return {
    id: row.id,
    ownerToken: row.owner_token,
    name: row.name,
    isDefault: row.is_default,
    shareToken: row.share_token ?? undefined,
    columns: emptyColumns(),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function attachCards(board: ScoutingBoard, cardRows: any[]): ScoutingBoard {
  const columns = emptyColumns();
  for (const row of cardRows) {
    const card: BoardCard = {
      athleteId: row.athlete_id,
      note: row.note ?? undefined,
      addedAt: row.added_at,
    };
    columns[row.column_key as BoardColumnKey].push(card);
  }
  return { ...board, columns };
}

function rowToProgram(row: any): RecruitingProgram {
  return {
    id: row.id,
    schoolName: row.school_name,
    division: row.division,
    coachName: row.coach_name ?? undefined,
    coachEmail: row.coach_email ?? undefined,
    notes: row.notes ?? undefined,
    stage: row.stage,
    addedAt: row.added_at,
  };
}

function rowToSavedSearch(row: any): SavedSearch {
  return {
    id: row.id,
    name: row.name,
    filters: row.filters ?? {},
    createdAt: row.created_at,
  };
}

function rowToEvent(row: any): AnalyticsEvent {
  return { type: row.type, ts: row.ts, meta: row.meta ?? undefined };
}

class SupabaseStore implements StatlineStore {
  // -- athletes --------------------------------------------------------

  async listAthletes(): Promise<AthleteProfile[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("athletes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToAthlete);
  }

  async getAthlete(id: string): Promise<AthleteProfile | null> {
    if (!UUID_RE.test(id)) return null;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("athletes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToAthlete(data) : null;
  }

  async createAthlete(
    data: Omit<AthleteProfile, "id" | "createdAt" | "updatedAt">
  ): Promise<AthleteProfile> {
    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("athletes")
      .insert(athleteToRow(data))
      .select("*")
      .single();
    if (error) throw error;
    return rowToAthlete(row);
  }

  async updateAthlete(
    id: string,
    data: Partial<AthleteProfile>
  ): Promise<AthleteProfile | null> {
    if (!UUID_RE.test(id)) return null;
    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("athletes")
      .update(athleteToRow(data))
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return row ? rowToAthlete(row) : null;
  }

  async deleteAthlete(id: string): Promise<boolean> {
    if (!UUID_RE.test(id)) return false;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("athletes")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw error;
    return (data ?? []).length > 0;
  }

  // -- NextAuth admin accounts (local JSON, unrelated to Supabase) ------

  private async listUsers(): Promise<UserRecord[]> {
    return readJson<UserRecord[]>(USERS_FILE, []);
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const all = await this.listUsers();
    return (
      all.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
    );
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    const all = await this.listUsers();
    return all.find((u) => u.id === id) ?? null;
  }

  async createUser(
    data: Omit<UserRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<UserRecord> {
    const all = await this.listUsers();
    const now = new Date().toISOString();
    const record: UserRecord = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    all.push(record);
    await writeJson(USERS_FILE, all);
    await this.recordEvent("signup", { userId: record.id });
    return record;
  }

  async updateUser(
    id: string,
    data: Partial<UserRecord>
  ): Promise<UserRecord | null> {
    const all = await this.listUsers();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const updated: UserRecord = {
      ...all[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    await writeJson(USERS_FILE, all);
    return updated;
  }

  // -- stars / follows ---------------------------------------------------

  async getFollowerCount(athleteId: string): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("athlete_id", athleteId);
    if (error) throw error;
    return count ?? 0;
  }

  async getStarredAthleteIds(ownerToken: string): Promise<string[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("stars")
      .select("athlete_id")
      .eq("owner_token", ownerToken);
    if (error) throw error;
    return (data ?? []).map((r) => r.athlete_id);
  }

  async toggleStar(ownerToken: string, athleteId: string): Promise<string[]> {
    const supabase = await createClient();
    const { data: existing, error: findError } = await supabase
      .from("stars")
      .select("athlete_id")
      .eq("owner_token", ownerToken)
      .eq("athlete_id", athleteId)
      .maybeSingle();
    if (findError) throw findError;

    if (existing) {
      const { error } = await supabase
        .from("stars")
        .delete()
        .eq("owner_token", ownerToken)
        .eq("athlete_id", athleteId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("stars")
        .insert({ owner_token: ownerToken, athlete_id: athleteId });
      if (error) throw error;
    }
    return this.getStarredAthleteIds(ownerToken);
  }

  async getFollowingIds(ownerToken: string): Promise<string[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("follows")
      .select("athlete_id")
      .eq("owner_token", ownerToken);
    if (error) throw error;
    return (data ?? []).map((r) => r.athlete_id);
  }

  async toggleFollow(ownerToken: string, athleteId: string): Promise<string[]> {
    const supabase = await createClient();
    const { data: existing, error: findError } = await supabase
      .from("follows")
      .select("athlete_id")
      .eq("owner_token", ownerToken)
      .eq("athlete_id", athleteId)
      .maybeSingle();
    if (findError) throw findError;

    if (existing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("owner_token", ownerToken)
        .eq("athlete_id", athleteId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ owner_token: ownerToken, athlete_id: athleteId });
      if (error) throw error;
    }
    return this.getFollowingIds(ownerToken);
  }

  // -- saved searches ------------------------------------------------------

  async listSavedSearches(ownerToken: string): Promise<SavedSearch[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("owner_token", ownerToken)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToSavedSearch);
  }

  async addSavedSearch(
    ownerToken: string,
    name: string,
    filters: Record<string, string>
  ): Promise<SavedSearch[]> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("saved_searches")
      .insert({ owner_token: ownerToken, name, filters });
    if (error) throw error;
    return this.listSavedSearches(ownerToken);
  }

  async removeSavedSearch(
    ownerToken: string,
    searchId: string
  ): Promise<SavedSearch[]> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("saved_searches")
      .delete()
      .eq("owner_token", ownerToken)
      .eq("id", searchId);
    if (error) throw error;
    return this.listSavedSearches(ownerToken);
  }

  // -- scouting boards -------------------------------------------------

  private async fetchBoardWithCards(
    boardId: string
  ): Promise<ScoutingBoard | null> {
    const supabase = await createClient();
    const { data: boardRow, error: boardError } = await supabase
      .from("scouting_boards")
      .select("*")
      .eq("id", boardId)
      .maybeSingle();
    if (boardError) throw boardError;
    if (!boardRow) return null;

    const { data: cardRows, error: cardsError } = await supabase
      .from("board_cards")
      .select("*")
      .eq("board_id", boardId);
    if (cardsError) throw cardsError;

    return attachCards(rowToBoard(boardRow), cardRows ?? []);
  }

  async listBoardsByOwnerToken(ownerToken: string): Promise<ScoutingBoard[]> {
    const supabase = await createClient();
    const { data: boardRows, error } = await supabase
      .from("scouting_boards")
      .select("*")
      .eq("owner_token", ownerToken)
      .order("created_at", { ascending: true });
    if (error) throw error;

    if (!boardRows || boardRows.length === 0) {
      const { data: created, error: createError } = await supabase
        .from("scouting_boards")
        .insert({ owner_token: ownerToken, name: "All Starred", is_default: true })
        .select("*")
        .single();
      if (createError) throw createError;
      return [rowToBoard(created)];
    }

    const boardIds = boardRows.map((b) => b.id);
    const { data: cardRows, error: cardsError } = await supabase
      .from("board_cards")
      .select("*")
      .in("board_id", boardIds);
    if (cardsError) throw cardsError;

    return boardRows.map((row) =>
      attachCards(
        rowToBoard(row),
        (cardRows ?? []).filter((c) => c.board_id === row.id)
      )
    );
  }

  async getBoardById(boardId: string): Promise<ScoutingBoard | null> {
    if (!UUID_RE.test(boardId)) return null;
    return this.fetchBoardWithCards(boardId);
  }

  async getBoardByShareToken(token: string): Promise<ScoutingBoard | null> {
    const supabase = await createClient();
    const { data: boardRow, error } = await supabase
      .from("scouting_boards")
      .select("*")
      .eq("share_token", token)
      .maybeSingle();
    if (error) throw error;
    if (!boardRow) return null;
    return this.fetchBoardWithCards(boardRow.id);
  }

  async createBoard(ownerToken: string, name: string): Promise<ScoutingBoard> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scouting_boards")
      .insert({ owner_token: ownerToken, name, is_default: false })
      .select("*")
      .single();
    if (error) throw error;
    return rowToBoard(data);
  }

  async renameBoard(
    boardId: string,
    name: string
  ): Promise<ScoutingBoard | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scouting_boards")
      .update({ name })
      .eq("id", boardId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return this.fetchBoardWithCards(data.id);
  }

  async deleteBoard(boardId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scouting_boards")
      .delete()
      .eq("id", boardId)
      .select("id");
    if (error) throw error;
    return (data ?? []).length > 0;
  }

  async setBoardShareEnabled(
    boardId: string,
    enabled: boolean
  ): Promise<ScoutingBoard | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scouting_boards")
      .update({ share_token: enabled ? uuid() : null })
      .eq("id", boardId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return this.fetchBoardWithCards(data.id);
  }

  async addAthleteToBoard(
    boardId: string,
    athleteId: string
  ): Promise<ScoutingBoard | null> {
    const supabase = await createClient();
    const { data: existing, error: findError } = await supabase
      .from("board_cards")
      .select("id")
      .eq("board_id", boardId)
      .eq("athlete_id", athleteId)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) {
      const { error } = await supabase
        .from("board_cards")
        .insert({ board_id: boardId, athlete_id: athleteId, column_key: "toContact" });
      if (error) throw error;
    }
    return this.fetchBoardWithCards(boardId);
  }

  async removeAthleteFromBoard(
    boardId: string,
    athleteId: string
  ): Promise<ScoutingBoard | null> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("board_cards")
      .delete()
      .eq("board_id", boardId)
      .eq("athlete_id", athleteId);
    if (error) throw error;
    return this.fetchBoardWithCards(boardId);
  }

  async moveBoardCard(
    boardId: string,
    athleteId: string,
    toColumn: BoardColumnKey
  ): Promise<ScoutingBoard | null> {
    const supabase = await createClient();
    const { data: updated, error: updateError } = await supabase
      .from("board_cards")
      .update({ column_key: toColumn })
      .eq("board_id", boardId)
      .eq("athlete_id", athleteId)
      .select("id");
    if (updateError) throw updateError;

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabase
        .from("board_cards")
        .insert({ board_id: boardId, athlete_id: athleteId, column_key: toColumn });
      if (insertError) throw insertError;
    }
    return this.fetchBoardWithCards(boardId);
  }

  async moveCardToBoard(
    fromBoardId: string,
    toBoardId: string,
    athleteId: string
  ): Promise<void> {
    if (fromBoardId === toBoardId) return;
    const supabase = await createClient();

    const { data: sourceCard, error: sourceError } = await supabase
      .from("board_cards")
      .select("note")
      .eq("board_id", fromBoardId)
      .eq("athlete_id", athleteId)
      .maybeSingle();
    if (sourceError) throw sourceError;
    if (!sourceCard) return;

    const { error: deleteError } = await supabase
      .from("board_cards")
      .delete()
      .eq("board_id", fromBoardId)
      .eq("athlete_id", athleteId);
    if (deleteError) throw deleteError;

    const { data: alreadyOnTarget, error: targetError } = await supabase
      .from("board_cards")
      .select("id")
      .eq("board_id", toBoardId)
      .eq("athlete_id", athleteId)
      .maybeSingle();
    if (targetError) throw targetError;

    if (!alreadyOnTarget) {
      const { error: insertError } = await supabase.from("board_cards").insert({
        board_id: toBoardId,
        athlete_id: athleteId,
        column_key: "toContact",
        note: sourceCard.note,
      });
      if (insertError) throw insertError;
    }
  }

  async updateBoardCardNote(
    boardId: string,
    athleteId: string,
    note: string
  ): Promise<ScoutingBoard | null> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("board_cards")
      .update({ note })
      .eq("board_id", boardId)
      .eq("athlete_id", athleteId);
    if (error) throw error;
    return this.fetchBoardWithCards(boardId);
  }

  // -- recruiting programs (international CRM) --------------------------

  async getRecruitingBoard(ownerToken: string): Promise<RecruitingBoard> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("recruiting_programs")
      .select("*")
      .eq("owner_token", ownerToken)
      .order("added_at", { ascending: true });
    if (error) throw error;
    const programs = (data ?? []).map(rowToProgram);
    const updatedAt = data?.length
      ? data.reduce((max, r) => (r.updated_at > max ? r.updated_at : max), data[0].updated_at)
      : new Date().toISOString();
    return { ownerToken, programs, updatedAt };
  }

  async addRecruitingProgram(
    ownerToken: string,
    program: Omit<RecruitingProgram, "id" | "addedAt">
  ): Promise<RecruitingBoard> {
    const supabase = await createClient();
    const { error } = await supabase.from("recruiting_programs").insert({
      owner_token: ownerToken,
      school_name: program.schoolName,
      division: program.division,
      coach_name: program.coachName,
      coach_email: program.coachEmail,
      notes: program.notes,
      stage: program.stage,
    });
    if (error) throw error;
    return this.getRecruitingBoard(ownerToken);
  }

  async updateRecruitingProgram(
    ownerToken: string,
    programId: string,
    data: Partial<RecruitingProgram>
  ): Promise<RecruitingBoard> {
    const supabase = await createClient();
    const row: Record<string, unknown> = {};
    if (data.schoolName !== undefined) row.school_name = data.schoolName;
    if (data.division !== undefined) row.division = data.division;
    if (data.coachName !== undefined) row.coach_name = data.coachName;
    if (data.coachEmail !== undefined) row.coach_email = data.coachEmail;
    if (data.notes !== undefined) row.notes = data.notes;
    if (data.stage !== undefined) row.stage = data.stage;
    row.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("recruiting_programs")
      .update(row)
      .eq("owner_token", ownerToken)
      .eq("id", programId);
    if (error) throw error;
    return this.getRecruitingBoard(ownerToken);
  }

  async removeRecruitingProgram(
    ownerToken: string,
    programId: string
  ): Promise<RecruitingBoard> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("recruiting_programs")
      .delete()
      .eq("owner_token", ownerToken)
      .eq("id", programId);
    if (error) throw error;
    return this.getRecruitingBoard(ownerToken);
  }

  // -- analytics ---------------------------------------------------------

  async recordEvent(
    type: string,
    meta?: Record<string, string>
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("analytics_events")
      .insert({ type, meta: meta ?? null });
    if (error) throw error;
  }

  async getRecentEvents(
    types: string[],
    limit: number
  ): Promise<AnalyticsEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("analytics_events")
      .select("type, meta, ts")
      .in("type", types)
      .order("ts", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(rowToEvent);
  }

  private async countEvents(type: string): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("type", type);
    if (error) throw error;
    return count ?? 0;
  }

  private async countAthletes(filters: {
    published: boolean;
    isInternational: boolean;
  }): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("athletes")
      .select("*", { count: "exact", head: true })
      .eq("published", filters.published)
      .eq("is_international", filters.isInternational);
    if (error) throw error;
    return count ?? 0;
  }

  async getAnalyticsSummary() {
    const [
      pageViews,
      profileViews,
      signups,
      profilesBuilt,
      directorySize,
      internationalDirectorySize,
    ] = await Promise.all([
      this.countEvents("page_view"),
      this.countEvents("profile_view"),
      this.countEvents("signup"),
      this.countEvents("profile_built"),
      this.countAthletes({ published: true, isInternational: false }),
      this.countAthletes({ published: true, isInternational: true }),
    ]);
    return {
      pageViews,
      profileViews,
      signups,
      profilesBuilt,
      directorySize,
      internationalDirectorySize,
    };
  }

  async getEventStats() {
    const supabase = await createClient();
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const dayAgo = new Date(now - DAY).toISOString();
    const weekAgo = new Date(now - 7 * DAY).toISOString();

    const [totalRes, last24hRes, last7dRes, typesRes, recentRes] =
      await Promise.all([
        supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .gte("ts", dayAgo),
        supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .gte("ts", weekAgo),
        supabase.from("analytics_events").select("type"),
        supabase
          .from("analytics_events")
          .select("type, meta, ts")
          .order("ts", { ascending: false })
          .limit(100),
      ]);

    if (totalRes.error) throw totalRes.error;
    if (last24hRes.error) throw last24hRes.error;
    if (last7dRes.error) throw last7dRes.error;
    if (typesRes.error) throw typesRes.error;
    if (recentRes.error) throw recentRes.error;

    const byTypeMap = new Map<string, number>();
    for (const row of typesRes.data ?? []) {
      byTypeMap.set(row.type, (byTypeMap.get(row.type) ?? 0) + 1);
    }
    const byType = Array.from(byTypeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: totalRes.count ?? 0,
      last24h: last24hRes.count ?? 0,
      last7d: last7dRes.count ?? 0,
      byType,
      recent: (recentRes.data ?? []).map(rowToEvent),
    };
  }
}

export const store: StatlineStore = new SupabaseStore();
