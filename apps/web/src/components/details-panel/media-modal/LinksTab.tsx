import React from "react";
import { Link2, Copy, Check, ExternalLink } from "lucide-react";

interface LinksTabProps {
  items?: {
    id: string;
    url: string;
    domain: string;
    title: string;
    description: string;
    thumbnail: string;
    date: string;
  }[];
  copiedId: string | null;
  onCopyLink: (id: string, url: string) => void;
}

export function LinksTab({ items = [], copiedId, onCopyLink }: LinksTabProps) {
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-450 dark:text-zinc-500 py-16 text-center">
        <p className="text-sm font-bold">No shared links</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-550 mt-1.5">Links shared in this chat will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((link) => (
        <div
          key={link.id}
          className="flex p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm hover:border-[#19E68C]/30 hover:shadow-md transition gap-4 text-left"
        >
          {/* Link graphic */}
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <img src={link.thumbnail} className="w-full h-full object-cover" alt="" />
          </div>

          {/* Link texts */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-[#19E68C] flex-shrink-0" />
                <span className="text-[10px] text-zinc-400 font-semibold tracking-wide uppercase">
                  {link.domain}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate mt-1">
                {link.title}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                {link.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 font-medium">{link.date}</span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onCopyLink(link.id, link.url)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-450 hover:text-emerald-600 transition"
                  title="Copy Link"
                >
                  {copiedId === link.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-455 hover:text-emerald-600 transition"
                  title="Open Link"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default LinksTab;
