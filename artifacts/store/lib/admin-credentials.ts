/**
 * Deployment ortamında tanımlı admin hesabını döndürür.
 *
 * Bu değerler yalnızca server tarafında okunur. `NEXT_PUBLIC_` öneki
 * kullanılmadığı için tarayıcı bundle'ına girmez.
 */
export function getConfiguredAdminCredentials() {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const configuredUsername =
    process.env.ADMIN_USERNAME?.trim() ??
    process.env.ADMIN_USER?.trim() ??
    process.env.ADMIN_LOGIN?.trim();
  const login = (configuredUsername || configuredEmail)?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!login || !password) return null;

  const email =
    configuredEmail ||
    (login.includes("@")
      ? login
      : `${login.replace(/[^a-z0-9._-]+/g, "-")}@admin.local`);
  const identifiers = Array.from(
    new Set([login, configuredEmail, configuredUsername?.toLowerCase(), email].filter(Boolean)),
  ) as string[];

  return { email, login, identifiers, password };
}