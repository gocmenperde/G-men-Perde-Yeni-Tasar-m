"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginClient() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async ({ email, password }: LoginForm) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) throw new Error("E-posta veya şifre hatalı.");
      toast.success("Giriş başarılı!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-zinc-900 dark:text-white">
            GÖÇMEN<span className="text-amber-500"> KIRTASİYE</span>
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mt-4">Hoş Geldiniz</h1>
          <p className="text-zinc-400 mt-1">Hesabınıza giriş yapın</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-8 shadow-xl shadow-zinc-100/50 dark:shadow-none">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  {...register("email", { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                  type="email"
                  placeholder="ornek@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">Geçerli e-posta girin.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  {...register("password", { required: true, minLength: 6 })}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm"
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
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-3.5 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </motion.button>
          </form>
        </div>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Hesabınız yok mu?{" "}
          <Link href="/register" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
            Kayıt Ol
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
