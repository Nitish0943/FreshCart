import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useToastStore } from "@/store/toast-store";
import { useRouter } from "next/navigation";

export function useOrdersQuery(status?: string) {
  return useQuery({
    queryKey: ["orders", { status }],
    queryFn: () => {
      const url = status ? `/api/v1/orders?status=${status}` : "/api/v1/orders";
      return apiClient(url).then((res) => res.data);
    },
  });
}

export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => apiClient(`/api/v1/orders/${orderId}`).then((res) => res.data),
    enabled: !!orderId,
  });
}

export function usePlaceOrderMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: any) =>
      apiClient("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      addToast({
        type: "success",
        title: "Order Placed",
        message: "Your purchase order was placed successfully!",
      });
      router.push(`/orders/success/${res.data.id}`);
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      apiClient(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      addToast({
        type: "success",
        title: "Status Updated",
        message: "Order status modified successfully.",
      });
    },
  });
}

export function useAssignRiderMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ orderId, deliveryBoyId }: { orderId: string; deliveryBoyId: string }) =>
      apiClient(`/api/v1/orders/${orderId}/assign`, {
        method: "POST",
        body: JSON.stringify({ deliveryBoyId }),
      }),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      addToast({
        type: "success",
        title: "Rider Assigned",
        message: " Rerouted order packaging task to delivery driver.",
      });
    },
  });
}
