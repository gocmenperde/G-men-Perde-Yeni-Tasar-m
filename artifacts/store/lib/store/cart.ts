import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId?: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
  dimensions?: {
    width?: number;
    height?: number;
    area?: number;
    pile?: string;
    pileFactor?: number;
    unit?: string;
  };
}

interface CartStore {
  items: CartItem[];
  appliedCouponCode: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  setAppliedCouponCode: (code: string) => void;
  clearAppliedCouponCode: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCouponCode: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
              appliedCouponCode: null,
            };
          }
          return { items: [...state.items, item], appliedCouponCode: null };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id), appliedCouponCode: null })),
      updateQty: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          appliedCouponCode: null,
        })),
      clearCart: () => set({ items: [], appliedCouponCode: null }),
      setAppliedCouponCode: (code) => set({ appliedCouponCode: code }),
      clearAppliedCouponCode: () => set({ appliedCouponCode: null }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "premium-cart", skipHydration: true }
  )
);
