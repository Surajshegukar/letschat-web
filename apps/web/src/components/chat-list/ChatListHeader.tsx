import { Search } from "lucide-react";
import { BrandLogo } from "../BrandLogo";

export default function ChatListHeader() {
    return (
        <>
            {/* Pane Header */}

            <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BrandLogo size={36} />
                    <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                        Let's Chat
                    </span>
                </div>

            </div>



            <div className="p-4 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm outline-none transition focus:border-[#19E68C] dark:text-zinc-205"
                    />
                </div>
            </div>

        </>
    )
}