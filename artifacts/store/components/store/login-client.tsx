"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginClient() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async ({ email, password }: LoginForm) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) throw new Error("E-posta veya şifre hatalı.");
      const session = await getSession();
      const firstName = session?.user?.name?.trim().split(/\s+/)[0];
      toast.success(firstName ? `Hoş geldiniz, ${firstName}!` : "Hoş geldiniz!");
      // Tam navigasyon, mobil Safari'de eski SessionProvider ağacının
      // "Giriş Yap" durumunu korumasını engeller.
      window.location.replace("/");
    } catch (err: any) {
      toast.error(err.message ?? "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center leading-none mb-4">
            <span className="text-2xl font-black text-zinc-900">
              GÖÇMEN <span className="text-[#B8973E]">KIRTASİYE</span>
            </span>
            <span className="text-[9px] tracking-widest text-zinc-400 uppercase mt-0.5">Bursa · EST. 1993</span>
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 mt-2">Hoş Geldiniz</h1>
          <p className="text-zinc-400 mt-1 text-sm">Hesabınıza giriş yapın</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 shadow-xl shadow-amber-100/30">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  {...register("email", { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                  type="email"
                  placeholder="ornek@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition text-sm text-zinc-800"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">Geçerli e-posta girin.</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  {...register("password", { required: true, minLength: 6 })}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition text-sm text-zinc-800"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">Şifre en az 6 karakter olmalı.</p>}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-[#B8973E] text-white font-bold py-3.5 rounded-2xl disabled:opacity-50 transition-colors shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : "Giriş Yap"}
            </motion.button>
          </form>

          <div className="flex items-center gap-2 mt-5 mb-4">
            <div className="flex-1 h-px bg-[#E8E0D5]" />
            <span className="text-xs text-zinc-400">veya</span>
            <div className="flex-1 h-px bg-[#E8E0D5]" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span>Güvenli bağlantı ile korunmaktasınız</span>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-5">
          Hesabınız yok mu?{" "}
          <Link href="/register" className="text-[#B8973E] font-bold hover:text-[#9E7F32] transition-colors">
            Kayıt Ol
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
