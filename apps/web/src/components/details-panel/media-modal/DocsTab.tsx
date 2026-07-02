import React from "react";
import { Download, FileText, FileSpreadsheet, FileArchive } from "lucide-react";
import { mockDocs } from "@/constants/mock-data";

export function DocsTab() {
  const getDocIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-rose-500" />;
      case "spreadsheet":
        return <FileSpreadsheet className="h-8 w-8 text-emerald-500" />;
      case "zip":
        return <FileArchive className="h-8 w-8 text-amber-500" />;
      default:
        return <FileText className="h-8 w-8 text-[#19E68C]" />;
    }
  };

  return (
    <div className="space-y-3">
      {mockDocs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm hover:border-[#19E68C]/30 hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150/40 dark:border-zinc-800">
              {getDocIcon(doc.type)}
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate leading-snug">
                {doc.name}
              </h4>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-medium">
                {doc.size} • {doc.date}
              </p>
            </div>
          </div>
          <button
            className="p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-450 hover:text-emerald-600 dark:hover:text-[#19E68C] transition"
            title="Download document"
          >
            <Download className="h-4.5 w-4.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
export default DocsTab;
