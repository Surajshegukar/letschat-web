import { useState, useEffect, useRef, useMemo } from "react";
import { useChatStore } from "@/store/chat-store";
import { EMOJI_CATEGORIES, EMOJI_KEYWORDS } from "@/constants/emoji-data";
import { validateFiles } from "@/constants/file-validation";
import { toast } from "sonner";

interface UseMessageInputProps {
  inputText: string;
  onChangeInput: (text: string) => void;
  onSendVoiceNote?: (file: File, duration: string) => void;
  onSendFiles?: (files: File[], captions: string[]) => void;
}

export interface PendingFile {
  file: File;
  previewUrl: string;
  caption: string;
}

export function useMessageInput({
  inputText,
  onChangeInput,
  onSendVoiceNote,
  onSendFiles,
}: UseMessageInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Smileys");
  const [emojiSearch, setEmojiSearch] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const emojiTrayRef = useRef<HTMLDivElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingSecondsRef = useRef(0);

  const replyingToMessage = useChatStore((state) => state.replyingToMessage);
  const setReplyingToMessage = useChatStore((state) => state.setReplyingToMessage);
  const editingMessage = useChatStore((state) => state.editingMessage);
  const setEditingMessage = useChatStore((state) => state.setEditingMessage);

  // Pre-fill input when entering edit mode
  useEffect(() => {
    if (editingMessage) {
      onChangeInput(editingMessage.content);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [editingMessage]);

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingSecondsRef.current = 0;
      timerRef.current = setInterval(() => {
        setRecordingSeconds((p) => {
          const next = p + 1;
          recordingSecondsRef.current = next;
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiTrayRef.current && !emojiTrayRef.current.contains(e.target as Node)) {
        setIsEmojiOpen(false);
      }
    };
    if (isEmojiOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEmojiOpen]);

  const handlePhotoClick = () => { photoInputRef.current?.click(); setIsMenuOpen(false); };
  const handleDocClick = () => { docInputRef.current?.click(); setIsMenuOpen(false); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);
    const { validateFiles: validate } = require("@/constants/file-validation");
    const error = validate(filesArray);
    if (error) { setFileError(error); e.target.value = ""; return; }
    setFileError(null);
    const previews: PendingFile[] = filesArray.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
    }));
    setPendingFiles(previews);
    e.target.value = "";
  };

  const handleSendPendingFiles = () => {
    if (pendingFiles.length === 0) return;
    onSendFiles?.(pendingFiles.map((p) => p.file), pendingFiles.map((p) => p.caption));
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingFiles([]);
  };

  const handleCancelPendingFiles = () => {
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingFiles([]);
  };

  const handleUpdateCaption = (index: number, caption: string) => {
    setPendingFiles((prev) => prev.map((p, i) => i === index ? { ...p, caption } : p));
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        const mins = Math.floor(recordingSecondsRef.current / 60);
        const secs = recordingSecondsRef.current % 60;
        const formatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

        if (onSendVoiceNote) {
          onSendVoiceNote(audioFile, formatted === "0:00" ? "0:02" : formatted);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsMenuOpen(false);
      setIsEmojiOpen(false);
    } catch (err) {
      console.error("Failed to access microphone", err);
      toast.error("Microphone access is required to record voice notes");
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    recordingSecondsRef.current = 0;
  };

  const handleSendVoiceNote = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const formatRecordTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? inputText.length;
      const end = input.selectionEnd ?? inputText.length;
      const newText = inputText.substring(0, start) + emoji + inputText.substring(end);
      onChangeInput(newText);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      onChangeInput(inputText + emoji);
    }
  };

  const filteredEmojis = useMemo(() => {
    const query = emojiSearch.trim().toLowerCase();
    if (!query) return EMOJI_CATEGORIES.find((c) => c.name === activeCategory)?.emojis ?? [];
    return Object.entries(EMOJI_KEYWORDS)
      .filter(([, keywords]) => keywords.includes(query))
      .map(([emoji]) => emoji);
  }, [activeCategory, emojiSearch]);

  return {
    isRecording,
    recordingSeconds,
    isMenuOpen,
    setIsMenuOpen,
    isEmojiOpen,
    setIsEmojiOpen,
    activeCategory,
    setActiveCategory,
    emojiSearch,
    setEmojiSearch,
    fileError,
    setFileError,
    pendingFiles,
    inputRef,
    emojiTrayRef,
    photoInputRef,
    docInputRef,
    replyingToMessage,
    setReplyingToMessage,
    editingMessage,
    setEditingMessage,
    filteredEmojis,
    handlePhotoClick,
    handleDocClick,
    handleFileChange,
    handleSendPendingFiles,
    handleCancelPendingFiles,
    handleUpdateCaption,
    handleStartRecording,
    handleCancelRecording,
    handleSendVoiceNote,
    formatRecordTime,
    handleEmojiSelect,
  };
}
