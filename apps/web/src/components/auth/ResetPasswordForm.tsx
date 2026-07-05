"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input, Button } from "@/components/ui";
import { useResetPassword } from "@/hooks/api/use-auth";
import { toast } from "sonner";

export default function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const searchParams = useSearchParams();
    const resetPasswordMutation = useResetPassword();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const token = searchParams.get("token") || "";
        if (!token) {
            toast.error("Reset token is missing or invalid");
            return;
        }

        resetPasswordMutation.mutate({ token, newPassword });
    };

    return (
        <section className="flex items-center justify-center p-4 sm:p-8 bg-[#FAFAFC] dark:bg-[#09090B] min-h-screen">
            <div className="w-full max-w-lg rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:backdrop-blur-md">

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-800 dark:text-white text-center">
                    Reset Password
                </h1>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
                    Please choose a strong new password to protect your account.
                </p>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <Input
                            type="password"
                            label="New Password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Input
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-12 font-bold uppercase tracking-wider text-sm"
                        disabled={resetPasswordMutation.isPending}
                    >
                        {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>

                <div className="flex justify-center mt-6">
                    <Link
                        href="/sign-in"
                        className="text-xs sm:text-sm text-zinc-600 hover:text-[#00C9FF] font-medium transition-all"
                    >
                        Back to
                        <span className="ml-1 font-medium text-[#00C9FF] hover:underline">
                            Sign In
                        </span>
                    </Link>
                </div>

            </div>
        </section>
    );
}
