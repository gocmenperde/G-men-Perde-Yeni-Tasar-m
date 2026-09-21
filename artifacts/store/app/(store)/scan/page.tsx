"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Flashlight, X, Keyboard, ArrowRight, ScanLine, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);

  const [state, setState] = useState<"idle" | "requesting" | "scanning" | "denied" | "unsupported">("idle");
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [lastDetected, setLastDetected] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  // BarcodeDetector API desteği var mı?
  const isSupported = typeof window !== "undefined" && "BarcodeDetector" in window;

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const navigateToBarcode = useCallback(
    (code: string) => {
      setScanSuccess(code);
      stopCamera();
      setTimeout(() => router.push(`/barkod/${encodeURIComponent(code)}`), 700);
    },
    [router, stopCamera]
  );

  const startScanning = useCallback(async () => {
    if (!isSupported) { setState("unsupported"); setShowManual(true); return; }

    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // BarcodeDetector — tüm yaygın formatlar
      // @ts-ignore
      detectorRef.current = new (window as any).BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "qr_code", "data_matrix"],
      });

      setState("scanning");

      const detect = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(detect);
          return;
        }
        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            if (code && code !== lastDetected) {
              setLastDetected(code);
              navigateToBarcode(code);
              return;
            }
          }
        } catch {}
        animFrameRef.current = requestAnimationFrame(detect);
      };

      animFrameRef.current = requestAnimationFrame(detect);
    } catch (err: any) {
      if (err.name === "NotAllowedError") setState("denied");
      else { setState("unsupported"); setShowManual(true); }
    }
  }, [isSupported, lastDetected, navigateToBarcode]);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn((v) => !v);
    } catch {}
  }, [torchOn]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = manualInput.trim();
    if (!val) return;
    navigateToBarcode(val);
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 z-10 relative">
        <Link href="/products" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
          <X className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-amber-400" />
          <h1 className="font-bold text-white">Barkod Tara</h1>
        </div>
        <button
          onClick={() => setShowManual((v) => !v)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          title="Manuel giriş"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </div>

      {/* Camera area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Video stream */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${state === "scanning" ? "opacity-100" : "opacity-0"}`}
          muted
          playsInline
          autoPlay
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay UI */}
        <AnimatePresence mode="wait">
          {scanSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="z-10 flex flex-col items-center gap-3 text-center px-8"
            >
              <CheckCircle className="w-16 h-16 text-emerald-400" />
              <p className="text-lg font-bold text-white">Barkod Okundu!</p>
              <p className="text-sm text-zinc-400 font-mono">{scanSuccess}</p>
              <p className="text-xs text-zinc-500">Ürün sayfasına yönlendiriliyorsunuz…</p>
            </motion.div>
          ) : state === "idle" ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="z-10 flex flex-col items-center gap-6 text-center px-8"
            >
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Camera className="w-10 h-10 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-1">Ürünü Tara</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Ürünün barkodunu kameranıza gösterin,<br />otomatik olarak ürün sayfasına gidelim.
                </p>
              </div>
              <button
                onClick={startScanning}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-500/30"
              >
                Kamerayı Aç
              </button>
            </motion.div>
          ) : state === "requesting" ? (
            <motion.div key="requesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-400">Kamera açılıyor…</p>
            </motion.div>
          ) : state === "denied" ? (
            <motion.div key="denied" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 flex flex-col items-center gap-4 text-center px-8">
              <CameraOff className="w-12 h-12 text-red-400" />
              <div>
                <h2 className="font-bold text-white mb-1">Kamera İzni Gerekli</h2>
                <p className="text-sm text-zinc-400">Tarayıcı ayarlarından kamera iznini verin, sonra sayfayı yenileyin.</p>
              </div>
              <button onClick={() => { setState("idle"); setShowManual(true); }} className="text-amber-400 text-sm font-semibold underline">
                Manuel barkod girişine geç
              </button>
            </motion.div>
          ) : state === "unsupported" ? (
            <motion.div key="unsupported" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 flex flex-col items-center gap-3 text-center px-8">
              <ScanLine className="w-10 h-10 text-zinc-500" />
              <p className="text-sm text-zinc-400">Tarayıcınız barkod taramayı desteklemiyor.<br />Barkodu elle girebilirsiniz.</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Scanning viewfinder overlay */}
        {state === "scanning" && !scanSuccess && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            {/* Dim sides */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Clear window */}
            <div className="relative w-64 h-48 sm:w-80 sm:h-56">
              <div className="absolute inset-0 bg-transparent rounded-2xl" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }} />
              {/* Corner brackets */}
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl",
              ].map((cls) => (
                <div key={cls} className={`absolute w-8 h-8 border-amber-400 ${cls}`} />
              ))}
              {/* Scanning line */}
              <motion.div
                className="absolute inset-x-2 h-0.5 bg-amber-400/80 rounded-full shadow-[0_0_8px_2px_rgba(251,191,36,0.5)]"
                animate={{ top: ["10%", "85%", "10%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="absolute bottom-[calc(50%-120px)] text-center text-sm text-white/80 font-medium drop-shadow">
              Barkodu çerçeve içine getirin
            </p>
          </div>
        )}

        {/* Torch button */}
        {state === "scanning" && (
          <button
            onClick={toggleTorch}
            className={`absolute bottom-6 right-6 z-20 p-3.5 rounded-2xl transition-all border ${
              torchOn ? "bg-amber-400 border-amber-300 text-zinc-900" : "bg-white/10 border-white/20 text-white"
            }`}
          >
            <Flashlight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Manual input panel */}
      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="z-20 bg-zinc-900 border-t border-white/10 px-4 py-5"
          >
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">Manuel Barkod Girişi</p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Barkod veya SKU numarası…"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-900 font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[11px] text-zinc-500 mt-2">
              Barkod üzerindeki sayıları girin veya ürün adını{" "}
              <Link href="/search" className="text-amber-400 underline">aramaya</Link> girin.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
