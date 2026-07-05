"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth-service";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const provider = searchParams.get("state"); // Google and GitHub state query parameter

    if (!code || !provider) {
      toast.error("Authentication parameters are missing");
      setErrorOccurred(true);
      router.push("/sign-in");
      return;
    }

    async function handleCallback() {
      try {
        const response = await authService.handleOAuthCallback(provider!, code!);
        const { accessToken, user } = response.data;
        
        // Log in the user in memory
        setAuth(user, accessToken);
        toast.success("Signed in successfully!");
        router.push("/chat");
      } catch (error: any) {
        const message = error.response?.data?.message || "OAuth authentication failed";
        toast.error(message);
        setErrorOccurred(true);
        router.push("/sign-in");
      }
    }

    handleCallback();
  }, [searchParams, setAuth, router]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#FAFAFC] dark:bg-[#09090B]">
      <BrandLogo size={96} />
      <div className="mt-6 flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-[#00C9FF] animate-spin mb-3" />
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
          Completing Sign In
        </h2>
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          {errorOccurred ? "Failed. Redirecting..." : "Verifying credentials..."}
        </p>
      </div>
    </div>
  );
}
