import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { store } from "@/lib/storage";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, role } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await store.getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const safeRole = role === "coach" ? "coach" : "athlete";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await store.createUser({
    name,
    email,
    passwordHash,
    role: safeRole,
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}
