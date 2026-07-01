import { useState, useEffect } from "react";

export function useSplashLoading(increment = 2, intervalMs = 50) {
  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [increment, intervalMs]);

  return {
    mounted,
    loadingProgress,
  };
}
