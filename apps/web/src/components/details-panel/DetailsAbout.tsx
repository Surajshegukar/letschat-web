import React from "react";

interface DetailsAboutProps {
  bio?: string;
}

export function DetailsAbout({
  bio = "Product Designer @ Let's Chat. Passionate about UI/UX design and building beautiful products.",
}: DetailsAboutProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider">
        About
      </span>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
        {bio}
      </p>
    </div>
  );
}
export default DetailsAbout;
