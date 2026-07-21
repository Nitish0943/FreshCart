import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import { useEffect } from "react";

export function useCart() {
  const user = useAuthStore((state) => state.user);
  const { sessionToken, setItems } = useCartStore();

  const query = useQuery({
    queryKey: ["cart", { userId: user?.id, sessionToken }],
    queryFn: () => {
      const url = `/api/v1/cart?sessionToken=${sessionToken}`;
      return apiClient(url).then((res) => res.data);
    },
    enabled: typeof window !== "undefined",
  });

  useEffect(() => {
    if (query.data && query.data.items) {
      const mapped = query.data.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.product?.name || "Product",
        price: item.product?.price || 0,
        quantity: item.quantity,
        unit: item.product?.unit || "pcs",
        imageUrl: item.product?.imageUrl || null,
      }));
      setItems(mapped);
    }
  }, [query.data, setItems]);

  return query;
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  const sessionToken = useCartStore((state) => state.sessionToken);
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      apiClient("/api/v1/cart", {
        method: "POST",
        body: JSON.stringify({ productId, quantity, sessionToken }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      addToast({
        type: "success",
        title: "Added to Cart",
        message: "Item was added successfully.",
      });
    },
  });
}

export function useUpdateCartQtyMutation() {
  const queryClient = useQueryClient();
  const sessionToken = useCartStore((state) => state.sessionToken);

  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      apiClient("/api/v1/cart", {
        method: "PATCH",
        body: JSON.stringify({ cartItemId, quantity, sessionToken }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
