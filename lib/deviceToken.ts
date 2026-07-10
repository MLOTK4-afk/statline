import { cookies } from "next/headers";
import { DEVICE_ID_COOKIE } from "@/lib/deviceTokenCookie";

/**
 * The anonymous per-visitor identity used in place of a real user account.
 * Set by middleware.ts on first request; every non-admin write (building a
 * profile, starring, boards, saved searches) is scoped to this token instead
 * of a signed-in session, since the app allows anonymous form submission.
 */
export async function getDeviceToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(DEVICE_ID_COOKIE)?.value ?? null;
}
