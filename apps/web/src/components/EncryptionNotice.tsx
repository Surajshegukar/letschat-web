import React from "react";
import { Lock } from "lucide-react";

export function EncryptionNotice() {
  return (
    <div className="flex flex-col items-center pb-12 z-20 select-none pointer-events-none">
      {/* <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
        <Lock className="h-3.5 w-3.5 text-[#19E68C] stroke-[2.5]" />
        <span className="text-[13px] font-medium  tracking-wider uppercase">
          End-to-End Encrypted
        </span>
      </div> */}
      <p className="mt-1.5 text-[13px] font-medium text-slate-600 dark:text-gray-300">
        © 2026 Let's Chat. All rights reserved.
      </p>
    </div>
  );
}
