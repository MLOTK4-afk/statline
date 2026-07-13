/**
 * One accent color per sport, applied to that athlete's own profile page
 * (accent border, highlight-film button, banner scrim tint) so profiles
 * read as personalized rather than uniformly blue.
 *
 * Unlike the Compare page's categorical palette, these colors are never
 * shown side by side -- a viewer only ever sees one sport's color at a
 * time, on that one athlete's page -- so the binding constraint is just
 * "legible against navy-900," not mutual CVD-separation between sports.
 * Every value here was checked individually for >=3:1 contrast against
 * #0F172A via the dataviz skill's validate_palette.js; a couple of
 * adjacent sports (e.g. Wrestling/Track & Field) sit closer together than
 * the skill's categorical floor recommends, which is fine here since nothing
 * ever puts them side by side.
 */
export const SPORT_ACCENTS: Record<string, string> = {
  Football: "#C2410C",
  Basketball: "#D97706",
  Baseball: "#DC2626",
  Softball: "#CA8A04",
  Soccer: "#16A34A",
  Volleyball: "#0891B2",
  "Track & Field": "#E11D48",
  Wrestling: "#F43F5E",
  Lacrosse: "#0D9488",
  Tennis: "#65A30D",
  Golf: "#22C55E",
  Swimming: "#0284C7",
  Hockey: "#2563EB",
  "Cross Country": "#B45309",
  Rugby: "#7C3AED",
};

/** Falls back to the existing brand blue for any sport not in the map. */
export function getSportAccent(sport: string): string {
  return SPORT_ACCENTS[sport] ?? "#3B82F6";
}
