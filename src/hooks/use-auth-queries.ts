import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import { useRouter } from "next/navigation";

// Determine where to redirect after login based on user role
function getDefaultRedirectForRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "DELIVERY_BOY":
      return "/delivery/dashboard";
    default:
      return "/";
  }
}

export function useLoginMutation(redirectPath?: string) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const addToast = useToastStore((state) => state.addToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: any) =>
      apiClient("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: (res) => {
      const user = res.data.user;
      setUser(user);
      addToast({
        type: "success",
        title: "Welcome Back",
        message: "Signed in successfully!",
      });
      queryClient.invalidateQueries();
      // Use role-based redirect if no explicit redirect path, or if redirect is just "/"
      const destination = (redirectPath && redirectPath !== "/")
        ? redirectPath
        : getDefaultRedirectForRole(user.role);
      router.push(destination);
      router.refresh();
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: any) =>
      apiClient("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      addToast({
        type: "success",
        title: "Registration Complete",
        message: "Your profile was created. Please sign in.",
      });
      router.push("/login");
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const addToast = useToastStore((state) => state.addToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient("/api/v1/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      logout();
      addToast({
        type: "info",
        title: "Signed Out",
        message: "You have signed out of your session.",
      });
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });
}
