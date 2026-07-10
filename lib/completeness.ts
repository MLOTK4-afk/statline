export interface CompletenessInput {
  name: string;
  sport: string | null;
  level: string | null;
  region: string;
  hasStats: boolean;
  highlightUrl: string;
  achievements: string[];
  contactEmail: string;
  endorsementQuote: string;
}

export interface CompletenessResult {
  percent: number;
  missing: string[];
}

export function computeCompleteness(
  input: CompletenessInput
): CompletenessResult {
  let percent = 0;
  const missing: string[] = [];

  if (input.name.trim() && input.sport && input.level) {
    percent += 30;
  } else {
    missing.push("name, sport, and level");
  }

  if (input.region.trim()) {
    percent += 10;
  } else {
    missing.push("region");
  }

  if (input.hasStats) {
    percent += 20;
  } else {
    missing.push("stats");
  }

  if (input.highlightUrl.trim()) {
    percent += 15;
  } else {
    missing.push("highlight video");
  }

  if (input.achievements.some((a) => a.trim())) {
    percent += 10;
  } else {
    missing.push("achievements");
  }

  if (input.contactEmail.trim()) {
    percent += 10;
  } else {
    missing.push("contact email");
  }

  if (input.endorsementQuote.trim()) {
    percent += 5;
  } else {
    missing.push("coach endorsement");
  }

  return { percent, missing };
}
