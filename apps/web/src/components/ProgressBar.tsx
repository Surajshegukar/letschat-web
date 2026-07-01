import React from "react";
import { motion } from "framer-motion";
import { ProgressBarProps } from "@/types/splash";

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mt-10 flex w-72 flex-col items-center"
    >
      {/* Progress track */}
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-[#00C9FF] to-[#19E68C] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex w-full justify-between px-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        <span>Connecting</span>
        <span>{Math.min(Math.round(progress), 100)}%</span>
      </div>
    </motion.div>
  );
}
