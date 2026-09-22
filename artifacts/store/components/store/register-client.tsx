"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const INPUT = "w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition text-sm text-zinc-800";
const LABEL = "block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5";

export default function RegisterClient() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Kayıt başarısız.");
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      toast.success("Hesabınız oluşturuldu!");
      window.location.replace("/");
    } catch (err: any) {
      toast.error(err.message ?? "Kayıt oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center leading-none mb-4">
            <span className="text-2xl font-black text-zinc-900">
              GÖÇMEN <span className="text-[#B8973E]">PERDE</span>
            </span>
            <span className="text-[9px] tracking-widest text-zinc-400 uppercase mt-0.5">Bursa · EST. 1993</span>
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 mt-2">Hesap Oluştur</h1>
          <p className="text-zinc-400 mt-1 text-sm">Ücretsiz kayıt olun, alışverişe başlayın</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 shadow-xl shadow-amber-100/30">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={LABEL}>Ad Soyad</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input {...register("name", { required: true })} placeholder="Adınız Soyadınız" className={INPUT} />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">Ad soyad gerekli.</p>}
            </div>

            <div>
              <label className={LABEL}>E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                 <input {...register("email", { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} type="email" autoComplete="email" placeholder="ornek@email.com" className={INPUT} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">Geçerli e-posta girin.</p>}
            </div>

            <div>
              <label className={LABEL}>Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                 <input {...register("password", { required: true, minLength: 6 })} type={showPass ? "text" : "password"} autoComplete="new-password" placeholder="En az 6 karakter" className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition text-sm text-zinc-800" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">Şifre en az 6 karakter.</p>}
            </div>

            <div>
              <label className={LABEL}>Şifre Tekrar</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                 <input {...register("confirmPassword", { validate: (v) => v === watch("password") || "Şifreler eşleşmiyor" })} type="password" autoComplete="new-password" placeholder="Şifrenizi tekrar girin" className={INPUT} />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-[#B8973E] text-white font-bold py-3.5 rounded-2xl disabled:opacity-50 transition-colors shadow-lg mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kayıt olunuyor...
                </span>
              ) : "Kayıt Ol"}
            </motion.button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mt-5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span>Bilgileriniz güvenle korunur</span>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-5">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-[#B8973E] font-bold hover:text-[#9E7F32] transition-colors">
            Giriş Yap
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
