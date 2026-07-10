import { v4 as uuid } from "uuid";
import { readJson, writeJson } from "./fileStore";
import type {
  AnalyticsData,
  AnalyticsEvent,
  AthleteProfile,
  BoardCard,
  BoardColumnKey,
  RecruitingBoard,
  RecruitingProgram,
  ScoutingBoard,
  UserRecord,
} from "@/lib/types";

/**
 * Every route/component talks to data through this interface only.
 * Swapping the local JSON file store for a real database later means
 * writing a new class that implements StatlineStore and changing the
 * single export at the bottom of this file — nothing else changes.
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
  getFollowerCount(athleteId: string): Promise<number>;
  createUser(
    data: Omit<UserRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<UserRecord>;
  updateUser(
    id: string,
    data: Partial<UserRecord>
  ): Promise<UserRecord | null>;

  listBoardsByUserId(userId: string): Promise<ScoutingBoard[]>;
  getBoardById(boardId: string): Promise<ScoutingBoard | null>;
  getBoardByShareToken(token: string): Promise<ScoutingBoard | null>;
  createBoard(userId: string, name: string): Promise<ScoutingBoard>;
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

  getRecruitingBoard(userId: string): Promise<RecruitingBoard>;
  addRecruitingProgram(
    userId: string,
    program: Omit<RecruitingProgram, "id" | "addedAt">
  ): Promise<RecruitingBoard>;
  updateRecruitingProgram(
    userId: string,
    programId: string,
    data: Partial<RecruitingProgram>
  ): Promise<RecruitingBoard>;
  removeRecruitingProgram(
    userId: string,
    programId: string
  ): Promise<RecruitingBoard>;

  recordEvent(type: string, meta?: Record<string, string>): Promise<void>;
  getRecentEvents(
    types: string[],
    limit: number
  ): Promise<AnalyticsEvent[]>;
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

const ATHLETES_FILE = "athletes";
const USERS_FILE = "users";
const BOARDS_FILE = "boards";
const RECRUITING_BOARDS_FILE = "recruiting-boards";
const ANALYTICS_FILE = "analytics";

const emptyAnalytics: AnalyticsData = {
  pageViews: 0,
  profileViews: 0,
  signups: 0,
  profilesBuilt: 0,
  events: [],
};

function emptyScoutingBoard(
  userId: string,
  name: string,
  isDefault: boolean
): ScoutingBoard {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    userId,
    name,
    isDefault,
    columns: { toContact: [], contacted: [], replied: [], offerReceived: [] },
    createdAt: now,
    updatedAt: now,
  };
}

class LocalJsonStore implements StatlineStore {
  async listAthletes(): Promise<AthleteProfile[]> {
    return readJson<AthleteProfile[]>(ATHLETES_FILE, []);
  }

  async getAthlete(id: string): Promise<AthleteProfile | null> {
    const all = await this.listAthletes();
    return all.find((a) => a.id === id) ?? null;
  }

  async createAthlete(
    data: Omit<AthleteProfile, "id" | "createdAt" | "updatedAt">
  ): Promise<AthleteProfile> {
    const all = await this.listAthletes();
    const now = new Date().toISOString();
    const record: AthleteProfile = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    all.push(record);
    await writeJson(ATHLETES_FILE, all);
    return record;
  }

  async updateAthlete(
    id: string,
    data: Partial<AthleteProfile>
  ): Promise<AthleteProfile | null> {
    const all = await this.listAthletes();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    const updated: AthleteProfile = {
      ...all[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    await writeJson(ATHLETES_FILE, all);
    return updated;
  }

  async deleteAthlete(id: string): Promise<boolean> {
    const all = await this.listAthletes();
    const next = all.filter((a) => a.id !== id);
    if (next.length === all.length) return false;
    await writeJson(ATHLETES_FILE, next);
    return true;
  }

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

  async getFollowerCount(athleteId: string): Promise<number> {
    const all = await this.listUsers();
    return all.filter((u) => u.following?.includes(athleteId)).length;
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

  private async listAllBoards(): Promise<ScoutingBoard[]> {
    return readJson<ScoutingBoard[]>(BOARDS_FILE, []);
  }

  private async saveBoardObject(board: ScoutingBoard): Promise<ScoutingBoard> {
    const all = await this.listAllBoards();
    const idx = all.findIndex((b) => b.id === board.id);
    const updated = { ...board, updatedAt: new Date().toISOString() };
    if (idx === -1) all.push(updated);
    else all[idx] = updated;
    await writeJson(BOARDS_FILE, all);
    return updated;
  }

  async listBoardsByUserId(userId: string): Promise<ScoutingBoard[]> {
    const all = await this.listAllBoards();
    const userBoards = all.filter((b) => b.userId === userId);
    if (userBoards.length > 0) return userBoards;
    const created = emptyScoutingBoard(userId, "All Starred", true);
    all.push(created);
    await writeJson(BOARDS_FILE, all);
    return [created];
  }

  async getBoardById(boardId: string): Promise<ScoutingBoard | null> {
    const all = await this.listAllBoards();
    return all.find((b) => b.id === boardId) ?? null;
  }

  async getBoardByShareToken(token: string): Promise<ScoutingBoard | null> {
    const all = await this.listAllBoards();
    return all.find((b) => b.shareToken === token) ?? null;
  }

  async createBoard(userId: string, name: string): Promise<ScoutingBoard> {
    const all = await this.listAllBoards();
    const created = emptyScoutingBoard(userId, name, false);
    all.push(created);
    await writeJson(BOARDS_FILE, all);
    return created;
  }

  async renameBoard(
    boardId: string,
    name: string
  ): Promise<ScoutingBoard | null> {
    const board = await this.getBoardById(boardId);
    if (!board) return null;
    return this.saveBoardObject({ ...board, name });
  }

  async deleteBoard(boardId: string): Promise<boolean> {
    const all = await this.listAllBoards();
    const next = all.filter((b) => b.id !== boardId);
    if (next.length === all.length) return false;
    await writeJson(BOARDS_FILE, next);
    return true;
  }

  async setBoardShareEnabled(
    boardId: string,
    enabled: boolean
  ): Promise<ScoutingBoard | null> {
    const board = await this.getBoardById(boardId);
    if (!board) return null;
    return this.saveBoardObject({
      ...board,
      shareToken: enabled ? uuid() : undefined,
    });
  }

  async addAthleteToBoard(
    boardId: string,
    athleteId: string
  ): Promise<ScoutingBoard | null> {
    const board = await this.getBoardById(boardId);
    if (!board) return null;
    const alreadyOnBoard = (Object.keys(board.columns) as BoardColumnKey[]).some(
      (col) => board.columns[col].some((c) => c.athleteId === athleteId)
    );
    if (alreadyOnBoard) return board;
    board.columns.toContact.push({
      athleteId,
      addedAt: new Date().toISOString(),
    });
    return this.saveBoardObject(board);
  }

  async removeAthleteFromBoard(
    boardId: string,
    athleteId: string
  ): Promise<ScoutingBoard | null> {
    const board = await this.getBoardById(boardId);
    if (!board) return null;
    (Object.keys(board.columns) as BoardColumnKey[]).forEach((col) => {
      board.columns[col] = board.columns[col].filter(
        (c) => c.athleteId !== athleteId
      );
    });
    return this.saveBoardObject(board);
  }

  async moveBoardCard(
    boardId: string,
    athleteId: string,
    toColumn: BoardColumnKey
  ): Promise<ScoutingBoard | null> {
    const board = await this.getBoardById(boardId);
    if (!board) return null;
    let card: BoardCard | null = null;
    (Object.keys(board.columns) as BoardColumnKey[]).forEach((col) => {
      const idx = board.columns[col].findIndex(
        (c) => c.athleteId === athleteId
      );
      if (idx !== -1) {
        card = board.columns[col][idx];
        board.columns[col].splice(idx, 1);
      }
    });
    if (!card) card = { athleteId, addedAt: new Date().toISOString() };
    board.columns[toColumn].push(card);
    return this.saveBoardObject(board);
  }

  async moveCardToBoard(
    fromBoardId: string,
    toBoardId: string,
    athleteId: string
  ): Promise<void> {
    if (fromBoardId === toBoardId) return;
    const from = await this.getBoardById(fromBoardId);
    if (!from) return;
    let card: BoardCard | null = null;
    (Object.keys(from.columns) as BoardColumnKey[]).forEach((col) => {
      const idx = from.columns[col].findIndex(
        (c) => c.athleteId === athleteId
      );
      if (idx !== -1) {
        card = from.columns[col][idx];
        from.columns[col].splice(idx, 1);
      }
    });
    await this.saveBoardObject(from);
    if (!card) return;

    const to = await this.getBoardById(toBoardId);
    if (!to) return;
    const alreadyOnTarget = (Object.keys(to.columns) as BoardColumnKey[]).some(
      (col) => to.columns[col].some((c) => c.athleteId === athleteId)
    );
    if (!alreadyOnTarget) {
      to.columns.toContact.push(card);
      await this.saveBoardObject(to);
    }
  }

  async updateBoardCardNote(
    boardId: string,
    athleteId: string,
    note: string
  ): Promise<ScoutingBoard | null> {
    const board = await this.getBoardById(boardId);
    if (!board) return null;
    (Object.keys(board.columns) as BoardColumnKey[]).forEach((col) => {
      const card = board.columns[col].find((c) => c.athleteId === athleteId);
      if (card) card.note = note;
    });
    return this.saveBoardObject(board);
  }

  private async listAllRecruitingBoards(): Promise<RecruitingBoard[]> {
    return readJson<RecruitingBoard[]>(RECRUITING_BOARDS_FILE, []);
  }

  async getRecruitingBoard(userId: string): Promise<RecruitingBoard> {
    const all = await this.listAllRecruitingBoards();
    const existing = all.find((b) => b.userId === userId);
    if (existing) return existing;
    const created: RecruitingBoard = {
      userId,
      programs: [],
      updatedAt: new Date().toISOString(),
    };
    all.push(created);
    await writeJson(RECRUITING_BOARDS_FILE, all);
    return created;
  }

  private async saveRecruitingBoard(
    board: RecruitingBoard
  ): Promise<RecruitingBoard> {
    const all = await this.listAllRecruitingBoards();
    const idx = all.findIndex((b) => b.userId === board.userId);
    const updated = { ...board, updatedAt: new Date().toISOString() };
    if (idx === -1) all.push(updated);
    else all[idx] = updated;
    await writeJson(RECRUITING_BOARDS_FILE, all);
    return updated;
  }

  async addRecruitingProgram(
    userId: string,
    program: Omit<RecruitingProgram, "id" | "addedAt">
  ): Promise<RecruitingBoard> {
    const board = await this.getRecruitingBoard(userId);
    board.programs.push({
      ...program,
      id: uuid(),
      addedAt: new Date().toISOString(),
    });
    return this.saveRecruitingBoard(board);
  }

  async updateRecruitingProgram(
    userId: string,
    programId: string,
    data: Partial<RecruitingProgram>
  ): Promise<RecruitingBoard> {
    const board = await this.getRecruitingBoard(userId);
    board.programs = board.programs.map((p) =>
      p.id === programId ? { ...p, ...data } : p
    );
    return this.saveRecruitingBoard(board);
  }

  async removeRecruitingProgram(
    userId: string,
    programId: string
  ): Promise<RecruitingBoard> {
    const board = await this.getRecruitingBoard(userId);
    board.programs = board.programs.filter((p) => p.id !== programId);
    return this.saveRecruitingBoard(board);
  }

  async recordEvent(
    type: string,
    meta?: Record<string, string>
  ): Promise<void> {
    const data = await readJson<AnalyticsData>(ANALYTICS_FILE, emptyAnalytics);
    const event: AnalyticsEvent = { type, ts: new Date().toISOString(), meta };
    data.events.push(event);
    if (data.events.length > 2000) data.events = data.events.slice(-2000);
    if (type === "page_view") data.pageViews += 1;
    if (type === "profile_view") data.profileViews += 1;
    if (type === "signup") data.signups += 1;
    if (type === "profile_built") data.profilesBuilt += 1;
    await writeJson(ANALYTICS_FILE, data);
  }

  async getRecentEvents(
    types: string[],
    limit: number
  ): Promise<AnalyticsEvent[]> {
    const data = await readJson<AnalyticsData>(ANALYTICS_FILE, emptyAnalytics);
    return data.events
      .filter((e) => types.includes(e.type))
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, limit);
  }

  async getAnalyticsSummary() {
    const [data, athletes] = await Promise.all([
      readJson<AnalyticsData>(ANALYTICS_FILE, emptyAnalytics),
      this.listAthletes(),
    ]);
    return {
      pageViews: data.pageViews,
      profileViews: data.profileViews,
      signups: data.signups,
      profilesBuilt: data.profilesBuilt,
      directorySize: athletes.filter((a) => !a.isInternational && a.published)
        .length,
      internationalDirectorySize: athletes.filter(
        (a) => a.isInternational && a.published
      ).length,
    };
  }

  async getEventStats() {
    const data = await readJson<AnalyticsData>(ANALYTICS_FILE, emptyAnalytics);
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const byTypeMap = new Map<string, number>();
    let last24h = 0;
    let last7d = 0;
    for (const event of data.events) {
      byTypeMap.set(event.type, (byTypeMap.get(event.type) ?? 0) + 1);
      const age = now - new Date(event.ts).getTime();
      if (age <= DAY) last24h += 1;
      if (age <= 7 * DAY) last7d += 1;
    }
    const byType = Array.from(byTypeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    const recent = [...data.events]
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 100);
    return { total: data.events.length, last24h, last7d, byType, recent };
  }
}

export const store: StatlineStore = new LocalJsonStore();
