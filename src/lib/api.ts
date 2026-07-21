import { useToastStore } from "@/store/toast-store";

export async function apiClient<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type") && !(options?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(path, {
      ...options,
      headers,
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "An error occurred");
    }

    return result;
  } catch (err: any) {
    // Suppress notifications for prefill checks to avoid background lookup noise
    if (!path.includes("/checkout/prefill")) {
      useToastStore.getState().addToast({
        type: "error",
        title: "Request Failed",
        message: err.message || "Failed to process API call",
      });
    }
    throw err;
  }
}
