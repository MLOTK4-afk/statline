import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

const writeQueues = new Map<string, Promise<unknown>>();

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

async function ensureFile(name: string, fallback: unknown) {
  const target = filePath(name);
  try {
    await fs.access(target);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(target, JSON.stringify(fallback, null, 2), "utf-8");
  }
}

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  await ensureFile(name, fallback);
  const raw = await fs.readFile(filePath(name), "utf-8");
  if (!raw.trim()) return fallback;
  return JSON.parse(raw) as T;
}

/**
 * Writes are serialized per-file so concurrent API requests in dev
 * (a single Node process) never interleave and corrupt the JSON file.
 */
export function writeJson<T>(name: string, data: T): Promise<void> {
  const previous = writeQueues.get(name) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(filePath(name), JSON.stringify(data, null, 2), "utf-8");
    });
  writeQueues.set(name, next);
  return next;
}
