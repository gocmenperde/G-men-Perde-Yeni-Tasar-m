import { spawn } from "node:child_process";

const store = spawn(
  "pnpm",
  ["--filter", "@workspace/store", "run", "start"],
  {
    stdio: "inherit",
    // The shared workspace environment may contain PORT=3000 for local
    // tooling. The application router exposes the Store on port 5000.
    env: { ...process.env, PORT: "5000" },
  },
);

function shutdown(signal) {
  store.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

store.on("exit", (code, signal) => {
  shutdown("SIGTERM");
  process.exit(code ?? (signal ? 1 : 0));
});