import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useToastStore } from "@/store/toast-store";

export function useRidersQuery(status?: string) {
  return useQuery({
    queryKey: ["riders", { status }],
    queryFn: () => {
      const url = status ? `/api/v1/admin/delivery-boys?status=${status}` : "/api/v1/admin/delivery-boys";
      return apiClient(url).then((res) => res.data);
    },
  });
}

export function useCreateRiderMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: any) =>
      apiClient("/api/v1/admin/delivery-boys", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      addToast({
        type: "success",
        title: "Rider Enrolled",
        message: "Delivery boy profile matched successfully.",
      });
    },
  });
}

export function useRiderDashboardQuery() {
  return useQuery({
    queryKey: ["rider-dashboard"],
    queryFn: () => apiClient("/api/v1/delivery/dashboard").then((res) => res.data),
  });
}

export function useRiderStatusMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (status: "ACTIVE" | "OFFLINE") =>
      apiClient("/api/v1/delivery/status", {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      addToast({
        type: status === "ACTIVE" ? "success" : "info",
        title: status === "ACTIVE" ? "Online" : "Offline",
        message: `Rider is now ${status.toLowerCase()}.`,
      });
    },
  });
}

export function useRiderAssignmentMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ assignmentId, status }: { assignmentId: string; status: "DELIVERED" | "CANCELLED" }) => {
      const apiStatus = status === "DELIVERED" ? "COMPLETED" : "FAILED";
      return apiClient(`/api/v1/delivery/assignments/${assignmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: apiStatus }),
      });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      addToast({
        type: status === "DELIVERED" ? "success" : "warning",
        title: `Order ${status.toLowerCase()}`,
        message: `Delivery assignment was marked as ${status.toLowerCase()}.`,
      });
    },
  });
}

export function useCustomersQuery() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => apiClient("/api/v1/admin/customers").then((res) => res.data),
  });
}

export function useStartBatchMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (batchId: string) =>
      apiClient(`/api/v1/delivery/batches/${batchId}/start`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      addToast({
        type: "success",
        title: "Batch Started",
        message: "Batch dispatched. All orders are out for delivery.",
      });
    },
  });
}
