/**
 * Deployment ortamında tanımlı admin hesabını döndürür.
 *
 * Bu değerler yalnızca server tarafında okunur. `NEXT_PUBLIC_` öneki
 * kullanılmadığı için tarayıcı bundle'ına girmez.
 */
export function getConfiguredAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return null;

  return { email, password };
}