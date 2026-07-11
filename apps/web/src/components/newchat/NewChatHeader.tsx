"use client";

import React from "react";
import { ArrowLeft, Grid } from "lucide-react";

interface NewChatHeaderProps {
    title: string;
    onBack: () => void;
    showGridButton?: boolean;
    rightElement?: React.ReactNode;
}

export function NewChatHeader({ title, onBack, showGridButton = false, rightElement }: NewChatHeaderProps) {
    return (
        <div className="h-20 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C]"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                    {title}
                </h2>
            </div>
            {rightElement ? (
                rightElement
            ) : showGridButton ? (
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C]">
                    <Grid className="h-5 w-5" />
                </button>
            ) : null}
        </div>
    );
}
