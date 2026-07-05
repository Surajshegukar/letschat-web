"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input, Button, Checkbox, Divider } from "@/components/ui";
import SocialLogin from "./SocialLogin";
import { BrandLogo } from "../BrandLogo";
import { useLogin } from "@/hooks/api/use-auth";

export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const loginMutation = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <section className="flex items-center justify-center p-4 sm:p-8 bg-[#FAFAFC] dark:bg-[#09090B] min-h-screen">
            <div className="w-full max-w-lg rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:backdrop-blur-md">

                <h1 className=" text-2xl sm:text-3xl font-bold tracking-tight text-zinc-800 dark:text-white text-center">
                    Sign In
                </h1>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">
                    Enter your credentials to access your account.
                </p>

                <div className="mt-8">
                    <SocialLogin />
                </div>

                <div className="my-6">
                    <Divider />
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-[#00C9FF] hover:text-[#19E68C] transition"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center py-1">
                        <label className="flex gap-2 items-center cursor-pointer select-none">
                            <Checkbox />
                            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-350">
                                Remember me
                            </span>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-12 font-bold uppercase tracking-wider text-sm"
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                </form>
                <div className="flex justify-center">
                    <Link
                        href="/sign-up"
                        className="mt-4 text-xs sm:text-sm text-zinc-600 hover:text-[#00C9FF] font-medium transition-all"
                    >
                        Don't have an account?
                        <span className="ml-1.5 font-medium text-[#00C9FF] hover:underline">
                            Sign Up
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}