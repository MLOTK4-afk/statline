// One-time backfill: flags every athlete who currently qualifies for the
// Legend tier under the OLD rule (more than one sport, full stop) with
// legend_grandfathered = true, so tightening the rule in lib/tier.ts (now
// Legend requires Elite-level criteria AND multi-sport) doesn't retroactively
// demote anyone who already held Legend.
//
// Requires the legend_grandfathered column to already exist -- run the SQL
// in supabase-schema.sql (the `alter table ... add column ... legend_grandfathered`
// line) via the Supabase dashboard's SQL editor first.
//
// Talks to Supabase with the same anon-key client the app already uses
// server-side -- RLS on `athletes` is fully permissive for anon.
//
// Usage: node scripts/backfill-legend-grandfather.mjs
import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

async function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  const raw = await fs.readFile(envPath, "utf-8").catch(() => "");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

await loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("Fetching all athletes...");
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("id, name, additional_sports, legend_grandfathered");
  if (error) {
    console.error("Failed to list athletes:", error.message);
    process.exit(1);
  }
  console.log(`Found ${athletes.length} athlete(s).\n`);

  let grandfathered = 0;
  let alreadySet = 0;
  let skipped = 0;
  let failed = 0;

  for (const athlete of athletes) {
    const totalSports = 1 + (athlete.additional_sports?.length ?? 0);
    if (totalSports <= 1) {
      skipped++;
      continue;
    }
    if (athlete.legend_grandfathered) {
      console.log(`${athlete.name} ... already grandfathered`);
      alreadySet++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("athletes")
      .update({ legend_grandfathered: true })
      .eq("id", athlete.id);
    if (updateError) {
      console.log(`${athlete.name} ... FAILED: ${updateError.message}`);
      failed++;
      continue;
    }
    console.log(`${athlete.name} ... grandfathered (${totalSports} sports)`);
    grandfathered++;
  }

  console.log(
    `\nDone. ${grandfathered} newly grandfathered, ${alreadySet} already set, ${skipped} single-sport (skipped), ${failed} failed.`
  );
}

await main();
