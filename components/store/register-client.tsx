"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterClient() {
  const router = useRouter();
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
      router.push("/");
    } catch (err: any) {
      toast.error(err.message ?? "Kayıt oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-zinc-900 dark:text-white">
            PREMIUM<span className="text-amber-500">.</span>
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mt-4">Hesap Oluştur</h1>
          <p className="text-zinc-400 mt-1">Ücretsiz kayıt olun</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-8 shadow-xl shadow-zinc-100/50 dark:shadow-none">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input {...register("name", { required: true })} placeholder="Adınız Soyadınız" className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">Ad soyad gerekli.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input {...register("email", { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} type="email" placeholder="ornek@email.com" className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">Geçerli e-posta girin.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input {...register("password", { required: true, minLength: 6 })} type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">Şifre en az 6 karakter.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Şifre Tekrar</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input {...register("confirmPassword", { validate: (v) => v === watch("password") || "Şifreler eşleşmiyor" })} type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-3.5 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg mt-2">
              {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
            </motion.button>
          </form>
          <p className="text-center text-sm text-zinc-400 mt-6">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-zinc-900 dark:text-white font-semibold hover:text-amber-600 transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
