import { useState, useEffect, useMemo, useRef } from "react";

export function useAudioPlayer(duration: string, url?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = useMemo(() => {
    const parts = duration.split(":");
    return parseInt(parts[0] || "0", 10) * 60 + parseInt(parts[1] || "0", 10);
  }, [duration]);

  // Create HTMLAudioElement on mount or url change
  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setCurrentSeconds(Math.floor(audio.currentTime));
        setProgress((audio.currentTime / audio.duration) * 100);
      } else {
        setCurrentSeconds(Math.floor(audio.currentTime));
        setProgress((audio.currentTime / totalSeconds) * 100);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentSeconds(0);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
  }, [url, totalSeconds]);

  const togglePlay = () => {
    if (!audioRef.current) {
      // Fallback to simulation if no real URL (e.g. mock messages)
      setIsPlaying((p) => !p);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("Audio playback failed", err));
    }
  };

  // Simulation fallback for mock messages that have no real URL
  useEffect(() => {
    if (url) return; // If real audio exists, skip simulation
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            setProgress(0);
            return 0;
          }
          const next = prev + 1;
          setProgress((next / totalSeconds) * 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSeconds, url]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return { isPlaying, progress, currentSeconds, togglePlay, formatTime };
}
