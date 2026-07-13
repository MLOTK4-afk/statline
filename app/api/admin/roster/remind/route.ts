import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

/**
 * Logs a "reminder sent" event per athlete for the admin roster's bulk
 * action. There's no email or push-notification system anywhere in this
 * app to actually deliver a reminder, so this only records the action for
 * follow-up/audit purposes -- it does not notify the athlete. The UI is
 * explicit about that (see RosterTable's toast copy).
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { athleteIds } = await req.json();
  if (!Array.isArray(athleteIds) || athleteIds.length === 0) {
    return NextResponse.json(
      { error: "athleteIds is required." },
      { status: 400 }
    );
  }

  await Promise.all(
    athleteIds.map((athleteId: string) =>
      store.recordEvent("reminder_sent", { athleteId })
    )
  );

  return NextResponse.json({ logged: athleteIds.length });
}
