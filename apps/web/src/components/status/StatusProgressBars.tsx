import React from "react";
import { StatusStory } from "@/types/status";

interface StatusProgressBarsProps {
  stories: StatusStory[];
  currentStoryIndex: number;
  progress: number;
}

export function StatusProgressBars({
  stories,
  currentStoryIndex,
  progress,
}: StatusProgressBarsProps) {
  return (
    <div className="flex gap-1.5 w-full">
      {stories.map((story, idx) => (
        <div
          key={story.id}
          className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-white rounded-full transition-all ease-linear"
            style={{
              width:
                idx === currentStoryIndex
                  ? `${progress}%`
                  : idx < currentStoryIndex
                  ? "100%"
                  : "0%",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default StatusProgressBars;
