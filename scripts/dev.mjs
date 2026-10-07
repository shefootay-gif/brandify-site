// `npm run dev`: starts the local PostgreSQL (if it isn't already running)
// and then the Next.js dev server.
import { spawn } from "node:child_process";
import net from "node:net";

const port = Number(process.env.LOCAL_PG_PORT ?? 54329);

const isOpen = () =>
  new Promise((resolve) => {
    const socket = net.connect(port, "127.0.0.1");
    socket.once("connect", () => (socket.destroy(), resolve(true)));
    socket.once("error", () => resolve(false));
  });

const children = [];
const run = (cmd, args) => {
  const child = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  children.push(child);
  return child;
};

if (!(await isOpen())) {
  run("node", ["scripts/db-local.mjs"]);
  for (let i = 0; i < 120 && !(await isOpen()); i++) await new Promise((r) => setTimeout(r, 500));
}

const next = run("npx", ["next", "dev"]);
next.on("exit", (code) => {
  children.forEach((c) => c.kill());
  process.exit(code ?? 0);
});
process.on("SIGINT", () => children.forEach((c) => c.kill("SIGINT")));
