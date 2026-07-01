import React from "react";
import clsx from "clsx";

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={clsx(
                "rounded-xl font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2",

                {
                    "bg-gradient-to-r from-[#00C9FF] to-[#19E68C] text-white hover:opacity-95 shadow-md shadow-[#00C9FF]/10 active:scale-[0.98]":
                        variant === "primary",

                    "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100":
                        variant === "secondary",

                    "border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200":
                        variant === "outline",

                    "h-10 px-4 text-sm": size === "sm",
                    "h-12 px-6": size === "md",
                    "h-14 px-8 text-lg": size === "lg",
                },

                className
            )}
            disabled={loading}
            {...props}
        >
            {loading ? "Loading..." : children}
        </button>
    );
}