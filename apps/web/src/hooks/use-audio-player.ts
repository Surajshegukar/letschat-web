import { useState, useEffect, useMemo } from "react";

export function useAudioPlayer(duration: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);

  const totalSeconds = useMemo(() => {
    const parts = duration.split(":");
    return parseInt(parts[0] || "0", 10) * 60 + parseInt(parts[1] || "0", 10);
  }, [duration]);

  useEffect(() => {
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
  }, [isPlaying, totalSeconds]);

  const togglePlay = () => setIsPlaying((p) => !p);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return { isPlaying, progress, currentSeconds, togglePlay, formatTime };
}
