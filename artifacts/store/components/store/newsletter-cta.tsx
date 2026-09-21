"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Mail, CheckCircle, ArrowRight, Gift, Bell, Percent, Sparkles } from "lucide-react";

const PERKS = [
  { icon: Gift,    label: "Hoş geldin kuponu", desc: "İlk siparişe %10 indirim" },
  { icon: Bell,    label: "Stok bildirimi",     desc: "Favorilerinde stok girince haber al" },
  { icon: Percent, label: "Özel fırsatlar",     desc: "Abonelere özel kampanyalar" },
];

export default function NewsletterCta() {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.ok || res.ok) setSubmitted(true);
      else setError(data.error ?? "Bir hata oluştu.");
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Multi-layer background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-[#0d0a06] to-zinc-900" />
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />
      <motion.div
        animate={{ opacity: [0.12, 0.25, 0.12], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute -top-40 left-1/4 w-[600px] h-[400px] bg-amber-500/20 blur-3xl pointer-events-none rounded-full"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        className="absolute -bottom-40 right-1/4 w-[500px] h-[400px] bg-orange-600/15 blur-3xl pointer-events-none rounded-full"
      />

      <div className="relative max-w-6xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full">
                E-Bülten
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-5">
              Fırsatları İlk Siz{" "}
              <span style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Öğrenin!
              </span>
            </h2>

            <p className="text-zinc-400 text-[16px] leading-relaxed mb-8 max-w-md">
              Haftada bir e-posta. Spam yok. Sadece gerçek fırsatlar, yeni ürünler ve kırtasiye dünyasından haberler.
            </p>

            {/* Perks */}
            <div className="space-y-3">
              {PERKS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold leading-none">{label}</p>
                    <p className="text-zinc-500 text-[12px] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: form card */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-[420px]"
          >
            <div className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/30"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-black text-white mb-2">Harika! Teşekkürler</h3>
                    <p className="text-zinc-400 text-sm">
                      Bültenimize başarıyla abone oldunuz. İlk fırsatı yakında e-postanıza göndereceğiz.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 1 }}>
                    <h3 className="text-xl font-black text-white mb-2">Abone Ol</h3>
                    <p className="text-zinc-400 text-sm mb-6">İstediğiniz zaman abonelikten çıkabilirsiniz.</p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e-posta adresiniz"
                          required
                          className="w-full pl-11 pr-4 py-3.5 bg-white/8 border border-white/15 focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/10 text-white placeholder-zinc-500 rounded-2xl outline-none transition-all text-sm"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-zinc-900 transition-all duration-200 text-[14px] shadow-xl shadow-amber-500/25 disabled:opacity-70"
                        style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Abone Ol — Ücretsiz
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </form>

                    {error && (
                      <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
                    )}

                    <p className="text-zinc-600 text-[11px] mt-4 text-center">
                      Kişisel verileriniz gizlilik politikamız kapsamında korunur.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
