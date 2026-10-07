// Local development database: a real PostgreSQL server whose binaries come
// from an npm package (no system install). Production uses managed Postgres.
//
// Postgres on Windows cannot run from a non-ASCII path (this project lives in
// an Arabic-named folder), so the binaries are copied once to ~/.brandify.
import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import pg from "pg";

const USER = "brandify";
const PASSWORD = "brandify_local";
const DB = "brandify";
const port = Number(process.env.LOCAL_PG_PORT ?? 54329);
const root = process.env.LOCAL_PG_DIR ?? path.join(homedir(), ".brandify");
const dataDir = path.join(root, "pgdata");

const pkgDir = path.join(
  process.cwd(),
  "node_modules",
  "@embedded-postgres",
  `${process.platform === "win32" ? "windows" : process.platform}-${process.arch}`,
);
const pkgJson = JSON.parse(readFileSync(path.join(pkgDir, "package.json"), "utf8"));
const srcNative = path.join(pkgDir, "native");
const binRoot = path.join(root, `pg-${pkgJson.version}`);
const bin = (name) =>
  path.join(binRoot, "bin", process.platform === "win32" ? `${name}.exe` : name);

mkdirSync(root, { recursive: true });

if (!existsSync(bin("postgres"))) {
  console.log("[db] Preparing PostgreSQL binaries (first run only)…");
  cpSync(srcNative, binRoot, { recursive: true });
}

if (!existsSync(path.join(dataDir, "PG_VERSION"))) {
  console.log("[db] Initialising database cluster…");
  const pwfile = path.join(tmpdir(), `brandify-pw-${process.pid}`);
  writeFileSync(pwfile, PASSWORD);
  const res = spawnSync(
    bin("initdb"),
    ["-D", dataDir, "-U", USER, `--pwfile=${pwfile}`, "-E", "UTF8", "--locale=C", "-A", "scram-sha-256"],
    { stdio: "inherit" },
  );
  rmSync(pwfile, { force: true });
  if (res.status !== 0) {
    console.error("[db] initdb failed");
    process.exit(1);
  }
}

const server = spawn(
  bin("postgres"),
  ["-D", dataDir, "-p", String(port), "-h", "127.0.0.1"],
  { stdio: ["ignore", "ignore", "pipe"] },
);
server.stderr.on("data", (d) => {
  const line = d.toString();
  if (/FATAL|PANIC|ERROR/.test(line)) process.stderr.write(`[db] ${line}`);
});
server.on("exit", (code) => {
  console.log(`[db] PostgreSQL exited (${code})`);
  process.exit(code ?? 0);
});

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    const client = new pg.Client({ host: "127.0.0.1", port, user: USER, password: PASSWORD, database: "postgres" });
    try {
      await client.connect();
      const { rowCount } = await client.query("select 1 from pg_database where datname = $1", [DB]);
      if (!rowCount) await client.query(`create database ${DB}`);
      await client.end();
      return;
    } catch {
      await client.end().catch(() => {});
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error("PostgreSQL did not become ready");
}

await waitReady();
console.log(`[db] PostgreSQL ready → postgres://${USER}:***@127.0.0.1:${port}/${DB}`);

const stop = () => {
  // SIGINT = "fast shutdown" for postgres; on Windows kill() terminates.
  server.kill("SIGINT");
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
