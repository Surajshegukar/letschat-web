"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({
    label,
    error,
    className,
    type,
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";
    
    // Resolve actual input type (text vs password)
    const resolvedType = isPasswordType
        ? (showPassword ? "text" : "password")
        : type;

    return (
        <div className="space-y-2">

            {label && (
                <label className="font-semibold text-sm text-slate-700 dark:text-slate-200 block">
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    {...props}
                    type={resolvedType}
                    className={clsx(
                        "w-full h-12 rounded-xl border border-zinc-300 px-4 outline-none transition bg-white text-zinc-900 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100",
                        "focus:border-[#00C9FF] focus:ring-4 focus:ring-[#00C9FF]/10",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-200",
                        isPasswordType && "pr-12", // Extra padding on right to make room for toggle button
                        className
                    )}
                />

                {isPasswordType && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition focus:outline-none"
                        tabIndex={-1} // Exclude from tab order so users can tab straight to the next input
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p className="text-red-500 text-sm">
                    {error}
                </p>
            )}

        </div>
    );
}