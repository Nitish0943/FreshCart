import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useToastStore } from "@/store/toast-store";

// ==========================================
// 1. CATEGORIES QUERIES & MUTATIONS
// ==========================================

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient("/api/v1/categories").then((res) => res.data),
    staleTime: 5 * 60 * 1000, // Categories rarely change — 5 minutes
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: any) =>
      apiClient("/api/v1/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      addToast({
        type: "success",
        title: "Category Created",
        message: "New category inserted successfully.",
      });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient(`/api/v1/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      addToast({
        type: "success",
        title: "Category Updated",
        message: "Category details modified successfully.",
      });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/categories/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      addToast({
        type: "warning",
        title: "Category Deleted",
        message: "Category removed from inventory logs.",
      });
    },
  });
}

// ==========================================
// 2. PRODUCTS QUERIES & MUTATIONS
// ==========================================

export function useProductsQuery(categoryId?: string) {
  return useQuery({
    queryKey: ["products", { categoryId }],
    queryFn: () => {
      const url = categoryId ? `/api/v1/products?categoryId=${categoryId}` : "/api/v1/products";
      return apiClient(url).then((res) => res.data);
    },
    placeholderData: keepPreviousData, // Show previous data while fetching new category
  });
}

export function useProductQuery(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => apiClient(`/api/v1/products/${productId}`).then((res) => res.data),
    enabled: !!productId,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: any) =>
      apiClient("/api/v1/products", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      addToast({
        type: "success",
        title: "Product Created",
        message: "New product listed in catalog.",
      });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient(`/api/v1/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      addToast({
        type: "success",
        title: "Product Updated",
        message: "Product details modified.",
      });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      addToast({
        type: "warning",
        title: "Product Deleted",
        message: "Product removed from catalog logs.",
      });
    },
  });
}
