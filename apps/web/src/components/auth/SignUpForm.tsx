"use client";

import Link from "next/link";
import { Input, Button, Checkbox, Divider } from "@/components/ui";
import SocialLogin from "./SocialLogin";

export default function SignUpForm() {
    return (
        <section className="flex items-center justify-center p-4 sm:p-8 bg-[#FAFAFC] dark:bg-[#09090B] min-h-screen">
            <div className="w-full max-w-lg rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:backdrop-blur-md">

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-800 dark:text-white text-center">
                    Create Account
                </h1>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">
                    Sign up to start communicating in real-time.
                </p>

                <div className="mt-8">
                    <SocialLogin />
                </div>

                <div className="my-6">
                    <Divider />
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <Input
                            type="text"
                            label="Username"
                            placeholder="johndoe"
                            required
                        />
                    </div>

                    <div>
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div>
                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex items-center py-1">
                        <label className="flex gap-2 items-center cursor-pointer select-none">
                            <Checkbox />
                            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-350">
                                I agree to the Terms of Service & Privacy Policy
                            </span>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-12 font-bold uppercase tracking-wider text-sm"
                    >
                        Sign Up
                    </Button>
                </form>

                <div className="flex justify-center mt-6">
                    <Link
                        href="/sign-in"
                        className="text-xs sm:text-sm text-zinc-600 hover:text-[#00C9FF] font-medium transition-all"
                    >
                        Already have an account?
                        <span className="ml-1.5 font-medium text-[#00C9FF] hover:underline">
                            Sign In
                        </span>
                    </Link>
                </div>

            </div>
        </section>
    );
}
