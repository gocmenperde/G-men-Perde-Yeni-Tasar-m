import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ComparisonProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  image?: string;
  brand?: string;
  category?: string;
  stock?: number;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
}

interface ComparisonState {
  items: ComparisonProduct[];
  add: (p: ComparisonProduct) => boolean; // returns false if already 3 items
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  count: () => number;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p) => {
        const { items } = get();
        if (items.length >= 3) return false;
        if (items.some((i) => i.id === p.id)) return true;
        set({ items: [...items, p] });
        return true;
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    { name: "gocmen-comparison", skipHydration: true }
  )
);
