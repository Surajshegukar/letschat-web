"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { authService } from "@/services/auth-service";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";

type StatusState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<StatusState>("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    setToken(tokenParam);

    if (!tokenParam) {
      setStatus("error");
      setMessage("Verification token is missing. Please request a new link.");
      return;
    }

    async function triggerVerification() {
      try {
        const response = await authService.verifyEmail(tokenParam!);
        setStatus("success");
        setMessage(response.message || "Your email has been verified successfully!");
      } catch (error: any) {
        setStatus("error");
        const errMsg = error.response?.data?.message || "Invalid or expired verification link.";
        setMessage(errMsg);
      }
    }

    // Trigger after a slight delay to ensure a smooth transition
    const timeout = setTimeout(triggerVerification, 1500);
    return () => clearTimeout(timeout);
  }, [searchParams]);

  return (
    <section className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#FAFAFC] text-slate-900 transition-colors duration-500 dark:bg-[#09090B] dark:text-slate-50 font-system p-4">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-[#00C9FF]/20 to-[#19E68C]/20 blur-[120px] dark:from-[#00C9FF]/10 dark:to-[#19E68C]/10" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-[#19E68C]/20 to-[#00C9FF]/20 blur-[120px] dark:from-[#19E68C]/10 dark:to-[#00C9FF]/10" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-200/80 bg-white/70 p-8 sm:p-10 shadow-2xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/60 text-center">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <BrandLogo size={64} />
          <h2 className="text-xl font-bold tracking-tight mt-3 text-zinc-800 dark:text-white">
            Let's Chat
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-4"
            >
              <Loader2 className="h-12 w-12 text-[#00C9FF] animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Verifying Account
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {message}
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-4"
            >
              <div className="h-16 w-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Verification Complete
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs leading-relaxed">
                {message}
              </p>
              <Button
                variant="primary"
                onClick={() => router.push("/sign-in")}
                className="w-full h-12 font-bold uppercase tracking-wider text-sm rounded-xl"
              >
                Proceed to Login
              </Button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-4"
            >
              <div className="h-16 w-16 bg-rose-500/10 dark:bg-rose-500/20 text-rose-505 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Verification Failed
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs leading-relaxed">
                {message}
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push("/sign-in")}
                className="w-full h-12 font-semibold text-sm rounded-xl border border-zinc-250 dark:border-zinc-800"
              >
                Back to Sign In
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
