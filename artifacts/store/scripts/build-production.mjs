import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const dynamicRouteFiles = [
  "app/(store)/kategori/[slug]/page.tsx",
  "app/(store)/marka/[slug]/page.tsx",
  "app/(store)/kirtasiye/[sehir]/page.tsx",
];

const staticParamsBlock = /\nexport async function generateStaticParams\(\) \{[\s\S]*?\n\}\n\n(?=export async function generateMetadata)/g;
const originals = new Map();

async function prepareDynamicRoutes() {
  for (const file of dynamicRouteFiles) {
    const source = await readFile(file, "utf8");
    originals.set(file, source);
    await writeFile(file, source.replace(staticParamsBlock, "\n"), "utf8");
  }
}

async function restoreDynamicRoutes() {
  await Promise.all(
    [...originals.entries()].map(([file, source]) => writeFile(file, source, "utf8")),
  );
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

await prepareDynamicRoutes();
let exitCode = 1;
try {
  // Database schema changes must not run as part of an application build.
  // The development database is not necessarily migration-baselined, and
  // production schema changes are applied by the publish/database workflow.
  exitCode = run("pnpm", ["exec", "prisma", "generate"]);
  if (exitCode === 0) exitCode = run("pnpm", ["exec", "next", "build"]);
} finally {
  await restoreDynamicRoutes();
}

process.exitCode = exitCode;