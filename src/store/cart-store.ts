import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalCartItem {
  id: string;
  productId: string;
  name: string;
  price: number; // in cents
  quantity: number;
  unit: string;
  imageUrl?: string | null;
}

interface CartState {
  items: LocalCartItem[];
  sessionToken: string;
  setItems: (items: LocalCartItem[]) => void;
  addItem: (item: Omit<LocalCartItem, "id">) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      sessionToken: typeof window !== "undefined" ? (localStorage.getItem("cart_session_token") || crypto.randomUUID()) : "",
      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return {
          items: [...state.items, { ...item, id: crypto.randomUUID() }],
        };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((i) => i.productId !== productId),
      })),
      updateQty: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter((i) => i.productId !== productId) };
        }
        return {
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        };
      }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);
