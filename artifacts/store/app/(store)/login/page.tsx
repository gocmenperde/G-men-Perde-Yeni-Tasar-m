import LoginClient from "@/components/store/login-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
