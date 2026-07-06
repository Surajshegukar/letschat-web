import React from "react";
import { AlertCircle, X } from "lucide-react";

interface FileErrorBannerProps {
  error: string;
  onDismiss: () => void;
}

export function FileErrorBanner({ error, onDismiss }: FileErrorBannerProps) {
  return (
    <div className="mx-2 mb-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2.5 animate-fadeIn">
      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-red-600 dark:text-red-400 flex-1 leading-relaxed">{error}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md text-red-400 hover:text-red-600 transition flex-shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
