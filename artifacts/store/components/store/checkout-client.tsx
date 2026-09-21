"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useSiteSettings } from "@/lib/store/site-settings";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Tag,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronDown,
  Plus,
  CheckCircle2,
  BookmarkPlus,
} from "lucide-react";
import ProductImage from "@/components/store/product-image";
import { TURKEY_PROVINCES, getDistricts } from "@/lib/turkey-cities";

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNo: string;
  apartmentNo: string;
  zipCode: string;
}

interface SavedAddress {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string | null;
  isDefault: boolean;
}

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent text-sm transition-colors min-h-[44px]";
const SELECT_CLASS =
  "w-full px-4 py-3 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent text-sm cursor-pointer appearance-none transition-colors min-h-[44px]";
const LABEL_CLASS = "block text-sm font-medium text-zinc-700 mb-1.5";
const ERROR_CLASS = "text-red-500 text-xs mt-1";

function parseAddressFields(fullAddress: string) {
  const parts = fullAddress.split("|").map((s) => s.trim());
  const addressPart = parts[0] ?? "";
  const streetMatch = addressPart.match(/^(.+?),?\s*No:\s*(\S+)\s*(?:D:\s*(\S+))?$/i);
  return {
    street: streetMatch?.[1]?.trim() ?? addressPart,
    buildingNo: streetMatch?.[2]?.trim() ?? "",
    apartmentNo: streetMatch?.[3]?.trim() ?? "",
  };
}

export default function CheckoutClient() {
  const { items, total, clearCart } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();
  const [couponInput, setCouponInput] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressTitle, setAddressTitle] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: { email: session?.user?.email ?? "" },
  });

  const watchedCity = watch("city");

  useEffect(() => {
    if (session?.user?.email) setValue("email", session.user.email);
  }, [session, setValue]);

  useEffect(() => {
    if (watchedCity) {
      const d = getDistricts(watchedCity);
      setDistricts(d);
      setValue("district", "");
    }
  }, [watchedCity, setValue]);

  useEffect(() => {
    if (!session) return;
    setLoadingAddresses(true);
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((json) => {
        const list: SavedAddress[] = json.data ?? [];
        setSavedAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) ?? list[0];
          setSelectedAddressId(def.id);
          setShowNewForm(false);
          fillForm(def);
        } else {
          setShowNewForm(true);
        }
      })
      .catch(() => setShowNewForm(true))
      .finally(() => setLoadingAddresses(false));
  }, [session]);

  function fillForm(addr: SavedAddress) {
    setValue("fullName", addr.fullName);
    setValue("phone", addr.phone);
    setValue("city", addr.city);
    const d = getDistricts(addr.city);
    setDistricts(d);
    setTimeout(() => setValue("district", addr.district), 50);
    const parts = addr.address.split(",").map((s) => s.trim());
    setValue("neighborhood", parts[0] ?? "");
    setValue("street", parts[1] ?? "");
    const noMatch = (parts[2] ?? "").match(/No:\s*(\S+)\s*(?:D:\s*(\S+))?/i);
    setValue("buildingNo", noMatch?.[1] ?? parts[2] ?? "");
    setValue("apartmentNo", noMatch?.[2] ?? "");
    setValue("zipCode", addr.zipCode ?? "");
  }

  const { freeShippingThreshold, shippingFee, load: loadSettings } = useSiteSettings();
  useEffect(() => { loadSettings(); }, [loadSettings]);

  const subtotal = total();
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const finalTotal = Math.max(0, subtotal - discount) + shipping;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), amount: subtotal }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Geçersiz kupon");
      setDiscount(json.discount ?? 0);
      setCouponApplied(couponInput.trim().toUpperCase());
      toast.success(`Kupon uygulandı! -₺${(json.discount ?? 0).toLocaleString("tr-TR")}`);
    } catch (err: any) {
      toast.error(err.message ?? "Kupon geçersiz.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (!session) { router.push("/login?callbackUrl=/checkout"); return; }
    if (items.length === 0) { toast.error("Sepetiniz boş."); return; }

    // Adres seçimi veya formu zorunlu
    if (!selectedAddressId && showNewForm) {
      if (!data.city || !data.district || !data.neighborhood || !data.street || !data.buildingNo) {
        toast.error("Teslimat adresi bilgilerini eksiksiz doldurun.");
        return;
      }
    }

    setLoading(true);
    try {
      const addressStr = [
        data.neighborhood,
        data.street,
        `No: ${data.buildingNo}${data.apartmentNo ? ` D: ${data.apartmentNo}` : ""}`,
      ].filter(Boolean).join(", ");

      // Yeni adresi kaydet (isteğe bağlı)
      if (saveAddress && showNewForm && addressTitle.trim()) {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: addressTitle.trim(),
            fullName: data.fullName,
            phone: data.phone,
            city: data.city,
            district: data.district,
            address: addressStr,
            zipCode: data.zipCode || null,
            isDefault: savedAddresses.length === 0,
          }),
        });
      }

      // Kayıtlı adres mi yoksa yeni form mu?
      const addressPayload = (!showNewForm && selectedAddressId)
        ? { addressId: selectedAddressId }
        : {
            address: {
              fullName: data.fullName,
              phone: data.phone,
              city: data.city,
              district: data.district,
              address: addressStr,
              zipCode: data.zipCode || null,
            },
          };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          couponCode: couponApplied || undefined,
          shipping,
          ...addressPayload,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Sipariş oluşturulamadı.");
      clearCart();
      toast.success("Siparişiniz oluşturuldu, ödeme sayfasına yönlendiriliyorsunuz.");
      router.push(`/payment/paytr?orderId=${result.data.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-zinc-200 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-zinc-900 mb-3">Sepetiniz Boş</h1>
        <p className="text-zinc-400 mb-6">Ödeme yapabilmek için sepetinize ürün ekleyin.</p>
        <a href="/products" className="inline-flex items-center gap-2 bg-zinc-900 text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity">
          Alışverişe Başla
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-zinc-900 mb-8">Güvenli Ödeme</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">

          {/* Kişisel Bilgiler */}
          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <div className="flex items-center gap-2 font-bold text-zinc-900 mb-5">
              <User className="w-5 h-5 text-amber-500" /> Kişisel Bilgiler
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>Ad Soyad *</label>
                <input
                  {...register("fullName", {
                    required: "Ad soyad zorunludur.",
                    minLength: { value: 3, message: "En az 3 karakter giriniz." },
                  })}
                  placeholder="Ad Soyad"
                  className={INPUT_CLASS}
                />
                {errors.fullName && <p className={ERROR_CLASS}>{errors.fullName.message}</p>}
              </div>
              <div>
                <label className={LABEL_CLASS}>E-posta *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    {...register("email", {
                      required: "E-posta zorunludur.",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Geçerli e-posta giriniz." },
                    })}
                    type="email"
                    placeholder="ornek@email.com"
                    className={`${INPUT_CLASS} pl-10`}
                  />
                </div>
                {errors.email && <p className={ERROR_CLASS}>{errors.email.message}</p>}
              </div>
              <div>
                <label className={LABEL_CLASS}>Telefon *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    {...register("phone", {
                      required: "Telefon numarası zorunludur.",
                      pattern: { value: /^(05)[0-9]{9}$/, message: "05 ile başlayan 11 haneli numara giriniz." },
                    })}
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    maxLength={11}
                    onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 11); }}
                    className={`${INPUT_CLASS} pl-10`}
                  />
                </div>
                {errors.phone && <p className={ERROR_CLASS}>{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <div className="flex items-center gap-2 font-bold text-zinc-900 mb-5">
              <Truck className="w-5 h-5 text-amber-500" /> Teslimat Adresi
            </div>

            {/* Kayıtlı Adresler */}
            {!loadingAddresses && savedAddresses.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Kayıtlı Adreslerim</p>
                <div className="space-y-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setShowNewForm(false);
                        fillForm(addr);
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedAddressId === addr.id && !showNewForm
                          ? "border-amber-400 bg-amber-50"
                          : "border-[#E8E0D5] hover:border-amber-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                            selectedAddressId === addr.id && !showNewForm
                              ? "border-amber-500 bg-amber-500"
                              : "border-zinc-300"
                          }`}>
                            {selectedAddressId === addr.id && !showNewForm && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                              {addr.title}
                              {addr.isDefault && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  Varsayılan
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">{addr.fullName} · {addr.phone}</p>
                            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                              {addr.address}, {addr.district}/{addr.city}
                            </p>
                          </div>
                        </div>
                        {selectedAddressId === addr.id && !showNewForm && (
                          <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => { setSelectedAddressId(null); setShowNewForm(true); reset({ email: session?.user?.email ?? "" }); setDistricts([]); }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      showNewForm
                        ? "border-amber-400 bg-amber-50"
                        : "border-dashed border-zinc-300 hover:border-amber-300"
                    }`}
                  >
                    <Plus className={`w-4 h-4 flex-shrink-0 ${showNewForm ? "text-amber-500" : "text-zinc-400"}`} />
                    <span className={`text-sm font-semibold ${showNewForm ? "text-amber-700" : "text-zinc-500"}`}>
                      Yeni Adres Ekle
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Adres Formu */}
            <AnimatePresence>
              {(showNewForm || savedAddresses.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* İl */}
                    <div>
                      <label className={LABEL_CLASS}>İl *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
                        <select
                          {...register("city", { required: "İl seçimi zorunludur." })}
                          className={`${SELECT_CLASS} pl-10 pr-10`}
                          defaultValue=""
                        >
                          <option value="" disabled>İl seçiniz</option>
                          {TURKEY_PROVINCES.map((p) => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      </div>
                      {errors.city && <p className={ERROR_CLASS}>{errors.city.message}</p>}
                    </div>

                    {/* İlçe */}
                    <div>
                      <label className={LABEL_CLASS}>İlçe *</label>
                      <div className="relative">
                        <select
                          {...register("district", { required: "İlçe seçimi zorunludur." })}
                          className={`${SELECT_CLASS} pr-10`}
                          defaultValue=""
                          disabled={districts.length === 0}
                        >
                          <option value="" disabled>
                            {districts.length === 0 ? "Önce il seçiniz" : "İlçe seçiniz"}
                          </option>
                          {districts.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      </div>
                      {errors.district && <p className={ERROR_CLASS}>{errors.district.message}</p>}
                    </div>

                    {/* Mahalle */}
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Mahalle / Köy *</label>
                      <input
                        {...register("neighborhood", { required: "Mahalle/köy bilgisi zorunludur." })}
                        placeholder="Örn: Osmangazi Mahallesi"
                        className={INPUT_CLASS}
                      />
                      {errors.neighborhood && <p className={ERROR_CLASS}>{errors.neighborhood.message}</p>}
                    </div>

                    {/* Cadde / Sokak */}
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Cadde / Sokak *</label>
                      <input
                        {...register("street", { required: "Cadde/sokak bilgisi zorunludur." })}
                        placeholder="Örn: Atatürk Caddesi"
                        className={INPUT_CLASS}
                      />
                      {errors.street && <p className={ERROR_CLASS}>{errors.street.message}</p>}
                    </div>

                    {/* Bina No + Daire No */}
                    <div>
                      <label className={LABEL_CLASS}>Bina No *</label>
                      <input
                        {...register("buildingNo", { required: "Bina no zorunludur." })}
                        placeholder="Bina no"
                        className={INPUT_CLASS}
                      />
                      {errors.buildingNo && <p className={ERROR_CLASS}>{errors.buildingNo.message}</p>}
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Daire No</label>
                      <input
                        {...register("apartmentNo")}
                        placeholder="Daire no (opsiyonel)"
                        className={INPUT_CLASS}
                      />
                    </div>

                    {/* Posta Kodu */}
                    <div>
                      <label className={LABEL_CLASS}>Posta Kodu</label>
                      <input
                        {...register("zipCode")}
                        placeholder="Posta kodu (opsiyonel)"
                        maxLength={5}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  {/* Adres Kaydet */}
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setSaveAddress(!saveAddress)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          saveAddress ? "bg-amber-500 border-amber-500" : "border-zinc-300"
                        }`}
                      >
                        {saveAddress && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div onClick={() => setSaveAddress(!saveAddress)}>
                        <p className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                          <BookmarkPlus className="w-4 h-4 text-amber-500" />
                          Bu adresi kaydet
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">Sonraki siparişlerde hızlıca seçebilirsiniz</p>
                      </div>
                    </label>
                    {saveAddress && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3"
                      >
                        <input
                          value={addressTitle}
                          onChange={(e) => setAddressTitle(e.target.value)}
                          placeholder="Adres başlığı (Örn: Ev, İş)"
                          className={INPUT_CLASS}
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Kayıtlı adres seçildiğinde adres özeti */}
            {!showNewForm && selectedAddressId && savedAddresses.length > 0 && (
              <div className="mt-3 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    {savedAddresses.find((a) => a.id === selectedAddressId)?.title} seçildi
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {savedAddresses.find((a) => a.id === selectedAddressId)?.address},{" "}
                    {savedAddresses.find((a) => a.id === selectedAddressId)?.district}/
                    {savedAddresses.find((a) => a.id === selectedAddressId)?.city}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Kupon */}
          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <div className="flex items-center gap-2 font-bold text-zinc-900 mb-4">
              <Tag className="w-5 h-5 text-amber-500" /> İndirim Kuponu
            </div>
            <div className="flex gap-3">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Kupon kodunuzu girin"
                disabled={!!couponApplied}
                className={`flex-1 ${INPUT_CLASS} font-mono`}
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={validatingCoupon || !!couponApplied}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-[#B8973E] text-white font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
              >
                {validatingCoupon ? "..." : couponApplied ? "Uygulandı ✓" : "Uygula"}
              </button>
            </div>
            {couponApplied && (
              <p className="text-green-600 text-xs mt-2 font-medium">
                ✓ {couponApplied} kuponu uygulandı — ₺{discount.toLocaleString("tr-TR")} indirim
              </p>
            )}
          </div>

          {/* Ödeme Yöntemi */}
          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <div className="flex items-center gap-2 font-bold text-zinc-900 mb-4">
              <ShieldCheck className="w-5 h-5 text-amber-500" /> PayTR ile Güvenli Ödeme
            </div>
            <p className="text-zinc-500 text-sm">
              Sipariş tamamlandığında PayTR güvenli ödeme ekranına yönlendirilirsiniz.
              256-bit SSL şifreleme ile korunur.
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-black py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-amber-500/20 disabled:opacity-60 text-lg"
          >
            {loading
              ? "Yönlendiriliyor..."
              : `Ödemeye Geç — ₺${finalTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
          </motion.button>
        </form>

        {/* Sipariş Özeti */}
        <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 h-fit sticky top-24">
          <h2 className="font-black text-lg text-zinc-900 mb-5">
            Sipariş ({items.length} ürün)
          </h2>
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF7F2] flex-shrink-0">
                  <ProductImage src={item.image} alt={item.name} fill className="object-cover" fallbackLabel="" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{item.name}</p>
                  <p className="text-xs text-zinc-400">{item.quantity} adet</p>
                </div>
                <p className="text-sm font-bold text-zinc-900 whitespace-nowrap">
                  ₺{(item.price * item.quantity).toLocaleString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E8E0D5] pt-4 space-y-2">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Ara Toplam</span>
              <span>₺{subtotal.toLocaleString("tr-TR")}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Kupon İndirimi</span>
                <span>-₺{discount.toLocaleString("tr-TR")}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Kargo</span>
              <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                {shipping === 0 ? "ÜCRETSİZ" : `₺${shipping.toLocaleString("tr-TR")}`}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-zinc-400">₺500 üzeri alışverişlerde kargo ücretsiz!</p>
            )}
            <div className="flex justify-between font-black text-xl text-zinc-900 pt-3 border-t border-[#E8E0D5]">
              <span>Toplam</span>
              <span>₺{finalTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
