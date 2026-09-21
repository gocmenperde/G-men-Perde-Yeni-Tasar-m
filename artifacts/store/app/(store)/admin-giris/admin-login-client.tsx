"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface LoginForm {
  email: string;
  password: string;
}

export default function AdminLoginClient() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async ({ email, password }: LoginForm) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) throw new Error("E-posta veya şifre hatalı.");
      toast.success("Admin girişi başarılı!");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-zinc-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <Link href="/" className="text-2xl font-black text-zinc-900">
            GÖÇMEN<span className="text-amber-500"> KIRTASİYE</span>
          </Link>
          <h1 className="text-xl font-black text-zinc-900 mt-3">Yönetici Girişi</h1>
          <p className="text-zinc-500 text-sm mt-1">Bu alan yalnızca yetkili yöneticilere açıktır.</p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-xl shadow-zinc-100/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  {...register("email", { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                  type="email"
                  placeholder="admin@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">Geçerli e-posta girin.</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  {...register("password", { required: true, minLength: 6 })}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">Şifre en az 6 karakter olmalı.</p>}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3.5 rounded-2xl disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/20 text-base"
            >
              {loading ? "Giriş yapılıyor..." : "Yönetici Olarak Giriş Yap"}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Müşteri girişi için{" "}
          <Link href="/login" className="text-amber-600 font-semibold hover:underline">
            buraya tıklayın
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
