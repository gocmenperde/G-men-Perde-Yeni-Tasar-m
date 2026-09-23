import { create } from "zustand";

interface SiteSettingsState {
  freeShippingThreshold: number;
  shippingFee: number;
  loaded: boolean;
  load: () => Promise<void>;
}

export const useSiteSettings = create<SiteSettingsState>((set, get) => ({
  freeShippingThreshold: 1500,
  shippingFee: 79.9,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const json = await res.json();
      set({
        freeShippingThreshold: json.data?.freeShippingThreshold ?? 1500,
        shippingFee: json.data?.shippingFee ?? 79.9,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },
}));
