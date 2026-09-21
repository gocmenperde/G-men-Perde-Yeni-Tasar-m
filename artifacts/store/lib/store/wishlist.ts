import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
}

interface WishlistStore {
  items: WishlistItem[];
  toggle: (id: string, name: string, price: number, image?: string, slug?: string) => void;
  has: (id: string) => boolean;
  count: () => number;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (id, name, price, image, slug = "") => {
        set((s) => {
          const exists = s.items.some((i) => i.id === id);
          return exists
            ? { items: s.items.filter((i) => i.id !== id) }
            : { items: [...s.items, { id, name, price, image, slug }] };
        });
      },
      has: (id) => get().items.some((i) => i.id === id),
      count: () => get().items.length,
      clear: () => set({ items: [] }),
    }),
    { name: "gocmen-wishlist", skipHydration: true }
  )
);
