import { readdirSync } from "node:fs";
    import { join } from "node:path";
    import { spawnSync } from "node:child_process";

    const storeDir = join(process.cwd(), "artifacts", "store");
    const migrationsDir = join(storeDir, "prisma", "migrations");
    const migrationDirectories = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

    function runPrisma(args) {
    const result = spawnSync("pnpm", ["exec", "prisma", ...args], {
      cwd: storeDir,
      stdio: "inherit",
    });

    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
    }

    for (const migration of migrationDirectories) {
    runPrisma(["db", "execute", "--file", join("prisma", "migrations", migration, "migration.sql")]);
    }

    for (const migration of migrationDirectories) {
    runPrisma(["migrate", "resolve", "--applied", migration]);
    }
    