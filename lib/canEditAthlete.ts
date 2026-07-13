import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Shared by every athlete-mutating API route (PATCH/DELETE, banner upload):
 * either the caller's anonymous device token matches the profile's owner
 * token, or they're signed in as a Statline admin.
 */
export async function canEditAthlete(
  ownerToken: string | null,
  athleteOwnerToken: string | null
): Promise<boolean> {
  if (ownerToken && ownerToken === athleteOwnerToken) return true;
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}
