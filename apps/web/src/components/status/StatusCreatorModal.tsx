import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Type, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui";
import { StatusTextCreator } from "./StatusTextCreator";
import { StatusImageCreator } from "./StatusImageCreator";

interface StatusCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (story: {
    type: "text" | "image" | "video";
    content: string;
    backgroundColor?: string;
    fontFamily?: string;
    caption?: string;
  }, file?: File) => void;
}

const GRADIENTS = [
  "from-[#00C9FF] to-[#19E68C]", // Cyan-Emerald Theme
  "from-teal-500 to-emerald-500", // Teal-Emerald
  "from-indigo-500 via-purple-500 to-pink-500", // Indigo-Pink
  "from-orange-400 to-rose-500", // Sunset Orange
  "from-zinc-900 via-slate-900 to-black", // Midnight
  "from-amber-400 to-orange-600", // Amber Gold
];

const FONTS = [
  { name: "Sans", class: "font-sans" },
  { name: "Serif", class: "font-serif" },
  { name: "Monospace", class: "font-mono" },
  { name: "Handwriting/Italic", class: "font-sans italic" },
  { name: "Bold Serif", class: "font-serif font-bold" },
];

const PRESET_IMAGES = [
  {
    name: "Coding",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
  },
  {
    name: "Coffee",
    url: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=800",
  },
  {
    name: "Nature",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  },
  {
    name: "Travel",
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
  },
  {
    name: "Aesthetic Setup",
    url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
  },
];

export function StatusCreatorModal({
  isOpen,
  onClose,
  onPublish,
}: StatusCreatorModalProps) {
  const [type, setType] = useState<"text" | "image" | "video">("text");
  
  // Text status state
  const [text, setText] = useState("");
  const [gradientIndex, setGradientIndex] = useState(0);
  const [fontIndex, setFontIndex] = useState(0);

  // Media (Image/Video) status state
  const [imageUrl, setImageUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const activeGradient = GRADIENTS[gradientIndex] || "from-[#00C9FF] to-[#19E68C]";
  const activeFont = FONTS[fontIndex] || { name: "Sans", class: "font-sans" };

  const resetState = () => {
    setText("");
    setGradientIndex(0);
    setFontIndex(0);
    setImageUrl("");
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaFile(null);
    setMediaPreviewUrl("");
    setCaption("");
    setActivePreset(null);
    setType("text");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const cycleGradient = () => {
    setGradientIndex((prev) => (prev + 1) % GRADIENTS.length);
  };

  const cycleFont = () => {
    setFontIndex((prev) => (prev + 1) % FONTS.length);
  };

  const handleSelectPreset = (url: string, index: number) => {
    setImageUrl(url);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaFile(null);
    setMediaPreviewUrl("");
    setActivePreset(index);
  };

  const handlePublish = () => {
    if (type === "text" && !text.trim()) return;
    if (type === "image" && !imageUrl.trim() && !mediaFile) return;
    if (type === "video" && !mediaFile) return;

    onPublish({
      type,
      content: type === "text" ? text : (mediaFile ? mediaPreviewUrl : imageUrl),
      backgroundColor: type === "text" ? activeGradient : undefined,
      fontFamily: type === "text" ? activeFont.class : undefined,
      caption: (type === "image" || type === "video") ? caption : undefined,
    }, mediaFile || undefined);
    
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden flex flex-col z-10 max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-150/40 dark:border-zinc-800/60 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create Status Update</h3>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl transition text-zinc-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Type Selector Tabs */}
            <div className="px-6 pt-4 flex gap-2 flex-shrink-0">
              <button
                onClick={() => setType("text")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
                  type === "text"
                    ? "bg-[#19E68C]/15 border-emerald-500/30 text-emerald-600 dark:text-[#19E68C]"
                    : "bg-zinc-50 dark:bg-zinc-950/40 border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100"
                }`}
              >
                <Type className="h-4 w-4" />
                <span>Text Status</span>
              </button>
              <button
                onClick={() => setType("image")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
                  type === "image"
                    ? "bg-[#19E68C]/15 border-emerald-500/30 text-emerald-600 dark:text-[#19E68C]"
                    : "bg-zinc-50 dark:bg-zinc-950/40 border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Image Status</span>
              </button>
              <button
                onClick={() => setType("video")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
                  type === "video"
                    ? "bg-[#19E68C]/15 border-emerald-500/30 text-emerald-600 dark:text-[#19E68C]"
                    : "bg-zinc-50 dark:bg-zinc-950/40 border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100"
                }`}
              >
                <Video className="h-4 w-4" />
                <span>Video Status</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {type === "text" ? (
                <StatusTextCreator
                  text={text}
                  setText={setText}
                  activeGradient={activeGradient}
                  activeFont={activeFont}
                  cycleGradient={cycleGradient}
                  cycleFont={cycleFont}
                />
              ) : (
                <StatusImageCreator
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  caption={caption}
                  setCaption={setCaption}
                  activePreset={activePreset}
                  setActivePreset={setActivePreset}
                  presetImages={PRESET_IMAGES}
                  handleSelectPreset={handleSelectPreset}
                  mediaFile={mediaFile}
                  setMediaFile={setMediaFile}
                  mediaPreviewUrl={mediaPreviewUrl}
                  setMediaPreviewUrl={setMediaPreviewUrl}
                  type={type}
                />
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/30 border-t border-zinc-150/40 dark:border-zinc-800/60 flex justify-end gap-3 flex-shrink-0">
              <Button variant="secondary" onClick={handleClose} className="h-11 px-5 rounded-xl font-bold">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={
                  type === "text"
                    ? !text.trim()
                    : type === "image"
                    ? !imageUrl.trim() && !mediaFile
                    : !mediaFile
                }
                className="h-11 px-6 rounded-xl font-bold"
              >
                Publish Status
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default StatusCreatorModal;
