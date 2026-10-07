// Create (or reset the password of) a dashboard admin.
//   npm run admin:create -- --email you@example.com --name "Your Name"
// The password comes from the ADMIN_PASSWORD env var; if it's not set, a
// strong random one is generated and written to .admin-credentials.local
// (git-ignored) instead of being printed. Change it after first login.
import { randomBytes, randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";
import * as schema from "../src/server/db/schema";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const email = arg("email")?.trim().toLowerCase();
const name = arg("name")?.trim() || "Brandify Admin";
const role = arg("role") === "editor" ? "editor" : "admin";
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Usage: npm run admin:create -- --email you@example.com [--name "Name"] [--role admin|editor]');
  process.exit(1);
}

const generated = !process.env.ADMIN_PASSWORD;
const password = process.env.ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

try {
  const hash = await hashPassword(password);
  const [existing] = await db.select().from(schema.user).where(eq(schema.user.email, email));
  if (existing) {
    await db
      .update(schema.account)
      .set({ password: hash, updatedAt: new Date() })
      .where(and(eq(schema.account.userId, existing.id), eq(schema.account.providerId, "credential")));
    await db.update(schema.user).set({ role }).where(eq(schema.user.id, existing.id));
    // Sign out everywhere after a reset.
    await db.delete(schema.session).where(eq(schema.session.userId, existing.id));
    console.log(`[admin] password reset for ${email}`);
  } else {
    const id = randomUUID();
    await db.insert(schema.user).values({ id, name, email, emailVerified: true, role });
    await db.insert(schema.account).values({ id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: hash });
    console.log(`[admin] created ${role} ${email}`);
  }
  if (generated) {
    writeFileSync(".admin-credentials.local", `email=${email}\npassword=${password}\n`, { mode: 0o600 });
    console.log("[admin] generated password saved to .admin-credentials.local (git-ignored). Change it after logging in.");
  }
} finally {
  await pool.end();
}
