export function assertDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return;
  }

  throw new Error(
    "DATABASE_URL is not set. Add it to your environment variables (for local development, create a .env.local file).",
  );
}
