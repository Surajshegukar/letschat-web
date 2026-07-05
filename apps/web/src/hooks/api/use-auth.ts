import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { LoginInput, RegisterInput, ResetPasswordInput } from "@/validation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Hook for login mutation.
 * Stores accessToken in memory, updates auth status, and redirects to chat.
 */
export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (response) => {
      const { accessToken, user } = response.data;
      setAuth(user, accessToken);
      // Invalidate queries so that the user gets fresh profile and conversation list
      queryClient.invalidateQueries();
      toast.success("Welcome back!");
      router.push("/chat");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    },
  });
}

/**
 * Hook for register mutation.
 */
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (response) => {
      toast.success(response.message || "Registration successful! Please check your email to verify.");
      router.push("/sign-in");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
    },
  });
}

/**
 * Hook for logout mutation.
 */
export function useLogout() {
  const clearAuth = useAuthStore((state) => state.logout);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // Clear TanStack Query cache on logout
      toast.success("Logged out successfully");
      router.push("/sign-in");
    },
    onError: (error: any) => {
      // Even if network request fails, clear local auth
      clearAuth();
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/sign-in");
    },
  });
}

/**
 * Hook for forgot password request.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (response) => {
      toast.success(response.message || "If the email exists, a password reset link has been sent.");
    },
    onError: (error: any) => {
      // Don't reveal account existence for security, but alert if something failed critically
      toast.success("If the email exists, a password reset link has been sent.");
    },
  });
}

/**
 * Hook for resetting password.
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordInput) => authService.resetPassword(data),
    onSuccess: (response) => {
      toast.success(response.message || "Password reset successful! Please log in.");
      router.push("/sign-in");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Password reset failed. Token might be expired.";
      toast.error(message);
    },
  });
}
