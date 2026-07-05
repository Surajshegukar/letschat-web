"use client";

import React from "react";
import { X } from "lucide-react";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  variant?: "danger" | "primary" | "warning";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isConfirming = false,
  variant = "primary",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  // Resolve color scheme based on variant
  const getConfirmButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-500 hover:bg-rose-600 text-white border-none";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white border-none";
      case "primary":
      default:
        return "bg-emerald-500 hover:bg-emerald-600 dark:bg-[#19E68C] dark:hover:bg-[#15c577] dark:text-black border-none font-bold";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-zinc-950/65 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={isConfirming ? undefined : onClose}
      />

      {/* Dialog container */}
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 disabled:opacity-50"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content message */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
          {message}
        </p>

        {/* Action button controls */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isConfirming}
            className="h-10 px-4 font-semibold text-sm rounded-xl border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
          >
            {cancelText}
          </Button>
          
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            className={`h-10 px-4 text-sm rounded-xl ${getConfirmButtonStyles()}`}
          >
            {isConfirming ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
