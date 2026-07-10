// Promotes or creates an admin account without ever hardcoding credentials.
// Usage: ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." node scripts/create-admin.mjs
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const usersPath = path.join(process.cwd(), "data", "users.json");

const name = process.env.ADMIN_NAME;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!name || !email || !password) {
  console.error(
    "Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD environment variables before running this script."
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const raw = await fs.readFile(usersPath, "utf-8").catch(() => "[]");
const users = JSON.parse(raw || "[]");

const passwordHash = await bcrypt.hash(password, 10);
const now = new Date().toISOString();
const existingIdx = users.findIndex(
  (u) => u.email.toLowerCase() === email.toLowerCase()
);

if (existingIdx !== -1) {
  users[existingIdx] = {
    ...users[existingIdx],
    name,
    passwordHash,
    role: "admin",
    updatedAt: now,
  };
  console.log(`Promoted existing user ${email} to admin.`);
} else {
  users.push({
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Created new admin user ${email}.`);
}

await fs.mkdir(path.dirname(usersPath), { recursive: true });
await fs.writeFile(usersPath, JSON.stringify(users, null, 2), "utf-8");
