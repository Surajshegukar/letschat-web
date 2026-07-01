import React from "react";
import { motion } from "framer-motion";

export function SplashBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Glow Blue (Soft, spacious desktop radial glow) */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          x: [0, 15, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-[5%] -top-[5%] h-[35vw] w-[35vw] min-w-[450px] rounded-full bg-[#00C9FF]/8 blur-[100px] dark:bg-[#00C9FF]/3"
      />

      {/* Glow Green (Soft, spacious desktop radial glow) */}
      <motion.div
        animate={{
          scale: [1.05, 1, 1.05],
          x: [0, -15, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-[5%] -bottom-[5%] h-[40vw] w-[40vw] min-w-[500px] rounded-full bg-[#19E68C]/6 blur-[120px] dark:bg-[#19E68C]/3"
      />

      {/* Subtle Diagonal Lines / Grid (SaaS Grid Background) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)]" />

      {/* Left Side Dot Grid */}
      <div className="absolute left-16 top-1/3 grid grid-cols-4 gap-3 opacity-25 dark:opacity-10">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`dot-left-${i}`} className="h-[3px] w-[3px] rounded-full bg-slate-400" />
        ))}
      </div>

      {/* Right Side Dot Grid */}
      <div className="absolute right-16 top-1/2 grid grid-cols-4 gap-3 opacity-25 dark:opacity-10">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`dot-right-${i}`} className="h-[3px] w-[3px] rounded-full bg-slate-400" />
        ))}
      </div>
    </div>
  );
}
