"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mesaj gönderilemedi.");
      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message ?? "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telefon",
      value: "0546 285 18 26",
      href: "tel:+905462851826",
      sub: "Pazartesi–Cumartesi 09:00–18:00",
    },
    {
      icon: Mail,
      title: "E-posta",
      value: "muhammedemint76@gmail.com",
      href: "mailto:muhammedemint76@gmail.com",
      sub: "24 saat içinde yanıt",
    },
    {
      icon: MapPin,
      title: "Adres",
      value: "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A",
      href: "https://maps.google.com/?q=Osmangazi+Bursa",
      sub: "Osmangazi / Bursa",
    },
    {
      icon: Clock,
      title: "Çalışma Saatleri",
      value: "Pazartesi – Cumartesi",
      href: undefined,
      sub: "09:00 – 18:00",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cream)] py-12 text-[var(--ink)] sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="section-label mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold-light)] bg-[var(--gold-pale)] px-4 py-2">
            <MessageSquare className="w-3 h-3" />
            Bize Ulaşın
          </div>
          <h1 className="mb-3 font-display text-5xl font-bold tracking-[-.04em] text-[var(--navy)] sm:text-6xl">Konuşalım.</h1>
          <p className="mx-auto max-w-lg text-[var(--ink-muted)]">Sorunuz, ürün arayışınız veya siparişiniz için mağazadaki deneyimimizi bir mesaj kadar yakına taşıyoruz.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="space-y-3 lg:col-span-2">
            {contactInfo.map(({ icon: Icon, title, value, href, sub }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    className="group flex gap-4 rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--gold-light)] hover:shadow-[var(--shadow-sm)]"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--gold-light)]/35 bg-[var(--gold-pale)] transition-colors group-hover:bg-[var(--gold-light)]/35">
                      <Icon className="h-5 w-5 text-[var(--gold)]" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[var(--navy)]">{title}</p>
                      <p className="mt-0.5 text-sm text-[var(--ink)]">{value}</p>
                      <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{sub}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex gap-4 rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-5">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--gold-light)]/35 bg-[var(--gold-pale)]">
                      <Icon className="h-5 w-5 text-[var(--gold)]" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[var(--navy)]">{title}</p>
                      <p className="mt-0.5 text-sm text-[var(--ink)]">{value}</p>
                      <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{sub}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <a
                href="https://wa.me/905462851826"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-[1.25rem] border border-[#25D366]/30 bg-[#25D366]/10 p-5 transition-colors hover:bg-[#25D366]/15"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[var(--navy)]">WhatsApp&apos;tan Yazın</p>
                  <p className="mt-0.5 text-xs text-[var(--ink-muted)]">En hızlı yanıt yöntemi</p>
                </div>
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-extrabold text-[var(--navy)]">Mesajınız İletildi!</h3>
                  <p className="mb-6 text-[var(--ink-muted)]">Mesajınız e-posta olarak iletildi. En kısa sürede dönüş yapacağız.</p>
                  <button
                    onClick={() => setSent(false)}
                    className="text-sm text-[#B8973E] hover:text-[#9E7F32] font-semibold underline underline-offset-2"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="mb-6 font-display text-3xl font-bold text-[var(--navy)]">Mesaj gönderin.</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wide">Ad Soyad *</label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Adınız Soyadınız"
                          className="w-full px-4 py-3 text-sm rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wide">E-posta *</label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="email@ornek.com"
                          className="w-full px-4 py-3 text-sm rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wide">Konu</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition"
                      >
                        <option value="">Konu Seçin</option>
                        <option value="Sipariş Hakkında">Sipariş Hakkında</option>
                        <option value="Ürün Kalitesi & Detayları">Ürün Kalitesi & Detayları</option>
                        <option value="Ürün Bilgisi">Ürün Bilgisi</option>
                        <option value="Teknik Destek">Teknik Destek</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wide">Mesajınız *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Mesajınızı buraya yazın..."
                        className="w-full px-4 py-3 text-sm rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-[#B8973E] text-white font-bold py-4 rounded-2xl transition-colors shadow-lg disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Gönderiliyor...
                        </span>
                      ) : (
                        <><Send className="w-4 h-4" /> Mesaj Gönder</>
                      )}
                    </motion.button>
                    <p className="text-center text-xs text-zinc-400">
                      Mesajınız doğrudan{" "}
                      <a href="mailto:muhammedemint76@gmail.com" className="text-[#B8973E] underline">
                        muhammedemint76@gmail.com
                      </a>{" "}
                      adresine iletilecektir.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
