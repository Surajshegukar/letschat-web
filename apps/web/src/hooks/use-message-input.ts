import { useState, useEffect, useRef, useMemo } from "react";
import { useChatStore } from "@/store/chat-store";
import { EMOJI_CATEGORIES, EMOJI_KEYWORDS } from "@/constants/emoji-data";
import { validateFiles } from "@/constants/file-validation";

interface UseMessageInputProps {
  inputText: string;
  onChangeInput: (text: string) => void;
  onSendVoiceNote?: (duration: string) => void;
  onSendFiles?: (files: File[]) => void;
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

  const inputRef = useRef<HTMLInputElement | null>(null);
  const emojiTrayRef = useRef<HTMLDivElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const replyingToMessage = useChatStore((state) => state.replyingToMessage);
  const setReplyingToMessage = useChatStore((state) => state.setReplyingToMessage);

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((p) => p + 1), 1000);
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
    const error = validateFiles(filesArray);
    if (error) { setFileError(error); e.target.value = ""; return; }
    setFileError(null);
    onSendFiles?.(filesArray);
    e.target.value = "";
  };

  const handleStartRecording = () => { setIsRecording(true); setIsMenuOpen(false); setIsEmojiOpen(false); };
  const handleCancelRecording = () => { setIsRecording(false); setRecordingSeconds(0); };

  const handleSendVoiceNote = () => {
    if (onSendVoiceNote) {
      const mins = Math.floor(recordingSeconds / 60);
      const secs = recordingSeconds % 60;
      const formatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
      onSendVoiceNote(formatted === "0:00" ? "0:02" : formatted);
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
    if (!query) {
      return EMOJI_CATEGORIES.find((c) => c.name === activeCategory)?.emojis ?? [];
    }
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
    inputRef,
    emojiTrayRef,
    photoInputRef,
    docInputRef,
    replyingToMessage,
    setReplyingToMessage,
    filteredEmojis,
    handlePhotoClick,
    handleDocClick,
    handleFileChange,
    handleStartRecording,
    handleCancelRecording,
    handleSendVoiceNote,
    formatRecordTime,
    handleEmojiSelect,
  };
}
