"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth-service";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

interface AuthContextType {
  isChecking: boolean;
}

const AuthContext = createContext<AuthContextType>({ isChecking: true });

export const useAuth = () => useContext(AuthContext);

// Public route prefixes that do not require authentication
const PUBLIC_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/callback",
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, setAuth, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Initial authentication check (Refresh Token exchange) on mount
  useEffect(() => {
    async function checkAuth() {
      // If the store already has a valid token (e.g. user just logged in and
      // Next.js navigated to /chat while the in-memory store is intact), skip
      // the refresh round-trip entirely. The 13-minute interval below will
      // keep the token fresh going forward.
      const { token: existingToken, user: existingUser } = useAuthStore.getState();
      if (existingToken && existingUser) {
        setIsChecking(false);
        return;
      }

      try {
        // Attempt to refresh the access token via HttpOnly cookie
        const refreshResponse = await authService.refreshToken();
        const accessToken = refreshResponse.data.accessToken;

        // Use the new access token to fetch user profile details
        // Set temp token first so getMe request has authorization header
        useAuthStore.setState({ token: accessToken });
        const meResponse = await authService.getMe();
        const currentUser = meResponse.data.user;

        // Commit both user and access token to store
        setAuth(currentUser, accessToken);
      } catch (error) {
        // Refresh failed (no cookie or invalid) -> reset auth state
        logout();
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [setAuth, logout]);

  // 2. Set up automated access token refresh timer (every 13 minutes)
  useEffect(() => {
    if (!token) return;

    const intervalId = setInterval(async () => {
      try {
        const refreshResponse = await authService.refreshToken();
        const newAccessToken = refreshResponse.data.accessToken;
        
        if (user) {
          setAuth(user, newAccessToken);
        }
      } catch (error) {
        logout();
        router.push("/sign-in");
      }
    }, 13 * 60 * 1000); // 13 minutes

    return () => clearInterval(intervalId);
  }, [token, user, setAuth, logout, router]);

  // 3. Route Guard: redirect based on auth status and current path
  useEffect(() => {
    if (isChecking) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    if (token) {
      // User is authenticated -> redirect away from auth pages to chat
      if (isPublicRoute) {
        router.push("/chat");
      }
    } else {
      // User is not authenticated -> redirect to sign-in from protected pages
      if (!isPublicRoute && pathname !== "/") {
        router.push("/sign-in");
      }
    }
  }, [token, isChecking, pathname, router]);

  // Display beautiful loading state during the initial auth check
  if (isChecking) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#FAFAFC] dark:bg-[#09090B] z-50">
        <BrandLogo size={96} />
        <div className="mt-6 flex flex-col items-center">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Let's Chat
          </h2>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isChecking }}>
      {children}
    </AuthContext.Provider>
  );
}
export default AuthProvider;
