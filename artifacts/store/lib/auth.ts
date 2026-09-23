import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { getConfiguredAdminCredentials } from "@/lib/admin-credentials";
import bcrypt from "bcryptjs";

const authSecret =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.SESSION_SECRET ??
  process.env.SECRET;

if (process.env.NODE_ENV === "production" && !authSecret) {
  throw new Error("Missing authentication secret environment variable.");
}

// NEXTAUTH_URL .env.local veya ortam değişkeninden gelir (gocmenperde.com.tr)
// Replit domain'i sadece NEXTAUTH_URL hiç ayarlanmamışsa yedek olarak kullan
if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL && process.env.REPLIT_DOMAINS) {
  const domains = process.env.REPLIT_DOMAINS.split(",").map((d: string) => d.trim());
  const customDomain = domains.find((d: string) => !d.includes("replit.app") && !d.includes("replit.dev"));
  process.env.NEXTAUTH_URL = `https://${customDomain ?? domains[0]}`;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  secret: authSecret,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        username: { label: "Kullanıcı adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const rawLogin = credentials?.email ?? credentials?.username;
        if (!rawLogin || !credentials?.password) return null;

        const normalizedLogin = rawLogin.toLowerCase().trim();
        const normalizedEmail = normalizedLogin;

        const user = normalizedEmail.includes("@")
          ? await db.user.findUnique({ where: { email: normalizedEmail } })
          : null;

        // Deployment'taki admin hesabı veritabanında henüz yoksa ilk başarılı
        // girişte oluşturulur. Kullanıcı zaten varsa, deployment parolası
        // değişmiş olsa bile mevcut bcrypt parolasına düşebilmek gerekir.
        const configuredAdmin = getConfiguredAdminCredentials();
        if (configuredAdmin && configuredAdmin.identifiers.includes(normalizedLogin)) {
          if (credentials.password === configuredAdmin.password) {
            const admin = await db.user.upsert({
              where: { email: configuredAdmin.email },
              update: {
                role: "ADMIN",
                password: await bcrypt.hash(configuredAdmin.password, 10),
                isBlocked: false,
              },
              create: {
                email: configuredAdmin.email,
                name: "Admin",
                role: "ADMIN",
                password: await bcrypt.hash(configuredAdmin.password, 10),
              },
            });

            return { id: admin.id, email: admin.email, name: admin.name, role: "ADMIN" };
          }
        }

        if (user?.password && !user.isBlocked) {
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (valid) {
            return { id: user.id, email: user.email, name: user.name, role: user.role };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
