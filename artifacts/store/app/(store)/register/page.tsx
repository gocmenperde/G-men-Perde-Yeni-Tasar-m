import RegisterClient from "@/components/store/register-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
