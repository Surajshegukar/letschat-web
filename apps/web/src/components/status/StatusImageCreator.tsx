import React, { useRef } from "react";
import { CheckCircle2, Upload, FileVideo, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface PresetImage {
  name: string;
  url: string;
}

interface StatusImageCreatorProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  caption: string;
  setCaption: (caption: string) => void;
  activePreset: number | null;
  setActivePreset: (index: number | null) => void;
  presetImages: PresetImage[];
  handleSelectPreset: (url: string, index: number) => void;
  mediaFile: File | null;
  setMediaFile: (file: File | null) => void;
  mediaPreviewUrl: string;
  setMediaPreviewUrl: (url: string) => void;
  type: "image" | "video";
}

export function StatusImageCreator({
  imageUrl,
  setImageUrl,
  caption,
  setCaption,
  activePreset,
  setActivePreset,
  presetImages,
  handleSelectPreset,
  mediaFile,
  setMediaFile,
  mediaPreviewUrl,
  setMediaPreviewUrl,
  type,
}: StatusImageCreatorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type matching
    if (type === "image" && !file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      toast.error("Please select a video file.");
      return;
    }

    if (type === "video") {
      // Validate video duration
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 10) {
          toast.error("Video duration must be 10 seconds or less!");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          // Store file
          const url = URL.createObjectURL(file);
          setMediaFile(file);
          setMediaPreviewUrl(url);
          setImageUrl("");
          setActivePreset(null);
        }
      };
      video.src = URL.createObjectURL(file);
    } else {
      // Image upload
      const url = URL.createObjectURL(file);
      setMediaFile(file);
      setMediaPreviewUrl(url);
      setImageUrl("");
      setActivePreset(null);
    }
  };

  const handleClearFile = () => {
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaFile(null);
    setMediaPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Trigger input selection logic
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
      const event = { target: fileInputRef.current } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  return (
    <div className="space-y-5">
      {type === "image" && (
        <>
          {/* Preset Images Gallery */}
          <div>
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-2 uppercase tracking-wide">
              Select A Preset Image
            </label>
            <div className="grid grid-cols-5 gap-2">
              {presetImages.map((preset, idx) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    handleClearFile();
                    handleSelectPreset(preset.url, idx);
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activePreset === idx
                      ? "border-emerald-500 shadow-md scale-[0.98]"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                    <span className="text-[9px] font-bold text-white leading-none truncate w-full">
                      {preset.name}
                    </span>
                  </div>
                  {activePreset === idx && (
                    <div className="absolute top-1 right-1 text-emerald-500">
                      <CheckCircle2 className="h-4.5 w-4.5 fill-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom URL Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Or Paste Custom Image URL
              </label>
              {imageUrl && (
                <button 
                  type="button"
                  onClick={() => { setImageUrl(""); setActivePreset(null); }} 
                  className="text-[10px] text-zinc-450 hover:text-rose-500 font-bold uppercase transition"
                >
                  Clear URL
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => {
                handleClearFile();
                setImageUrl(e.target.value);
                setActivePreset(null);
              }}
              className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#19E68C] focus:border-transparent transition-all"
            />
          </div>
        </>
      )}

      {/* Local File Uploader */}
      <div>
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-2">
          Upload {type === "image" ? "Image" : "Video"} File
        </label>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 dark:hover:border-[#19E68C]/40 rounded-2xl p-6 text-center cursor-pointer bg-zinc-50/30 dark:bg-zinc-950/10 hover:bg-zinc-50/70 dark:hover:bg-zinc-950/30 transition flex flex-col items-center justify-center gap-2 select-none"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={type === "image" ? "image/*" : "video/*"}
            className="hidden"
          />
          {mediaFile ? (
            <>
              {type === "image" ? (
                <ImageIcon className="h-8 w-8 text-emerald-500" />
              ) : (
                <FileVideo className="h-8 w-8 text-emerald-500" />
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                {mediaFile.name}
              </span>
              <span className="text-[10px] text-zinc-450">
                {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-zinc-400 dark:text-zinc-655" />
              <span className="text-xs text-slate-600 dark:text-zinc-400">
                Drag and drop your file here, or <span className="text-emerald-500 dark:text-[#19E68C] font-semibold">browse</span>
              </span>
              <span className="text-[10px] text-zinc-450 block">
                {type === "image" ? "PNG, JPG, WEBP, GIF (Max 10MB)" : "MP4, WEBM, MOV - Max 10s (Max 50MB)"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Preview Box */}
      {(mediaPreviewUrl || imageUrl) && (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-150 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center group shadow-sm select-none">
          {mediaPreviewUrl && type === "video" ? (
            <video
              src={mediaPreviewUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={mediaPreviewUrl || imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=600";
              }}
            />
          )}

          {mediaPreviewUrl && (
            <button
              type="button"
              onClick={handleClearFile}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs font-bold tracking-wide transition uppercase"
            >
              Remove
            </button>
          )}

          {caption && (
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-4 py-3 text-white text-center text-sm font-semibold">
              {caption}
            </div>
          )}
        </div>
      )}

      {/* Caption Input */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block">
          Caption
        </label>
        <input
          type="text"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#19E68C] focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}

export default StatusImageCreator;
