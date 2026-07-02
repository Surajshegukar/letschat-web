import React from "react";
import clsx from "clsx";

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({
    label,
    error,
    className,
    ...props
}: InputProps) {
    return (
        <div className="space-y-2">

            {label && (
                <label className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                    {label}
                </label>
            )}

            <input
                {...props}
                className={clsx(
                    "w-full h-12 rounded-xl border border-zinc-300 px-4 outline-none transition bg-white text-zinc-900 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100",

                    "focus:border-[#00C9FF] focus:ring-4 focus:ring-[#00C9FF]/10",

                    error && "border-red-500 focus:border-red-500 focus:ring-red-200",

                    className
                )}
            />

            {error && (
                <p className="text-red-500 text-sm">
                    {error}
                </p>
            )}

        </div>
    );
}