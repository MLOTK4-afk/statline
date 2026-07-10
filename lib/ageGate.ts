const AGE_GATE_KEY = "statline-age-verified";

export function hasAgeVerified(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AGE_GATE_KEY) === "true";
}

export function setAgeVerified() {
  window.localStorage.setItem(AGE_GATE_KEY, "true");
}

export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
