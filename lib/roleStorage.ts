export type UserRoleChoice = "athlete" | "coach" | "browse";

const ROLE_KEY = "user-role";

export function getStoredRole(): UserRoleChoice | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(ROLE_KEY);
  return value === "athlete" || value === "coach" || value === "browse"
    ? value
    : null;
}

export function setStoredRole(role: UserRoleChoice) {
  window.localStorage.setItem(ROLE_KEY, role);
}
