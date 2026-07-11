import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { statusService } from "@/services/status-service";
import { toast } from "sonner";

/**
 * Hook to retrieve self and contacts active statuses.
 */
export function useStatuses() {
  return useQuery({
    queryKey: ["statuses"],
    queryFn: () => statusService.getStatuses(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to publish a new status story (text or image).
 */
export function usePublishStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyData,
      file,
    }: {
      storyData: {
        type: "text" | "image" | "video";
        content?: string;
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
        caption?: string;
      };
      file?: File;
    }) => statusService.publishStatus(storyData, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
      toast.success("Status published successfully!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to publish status";
      toast.error(message);
    },
  });
}

/**
 * Hook to mark a specific story as viewed.
 */
export function useViewStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => statusService.viewStory(storyId),
    onSuccess: () => {
      // Invalidate to update hasUnread states and viewed lists
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
    onError: (error: any) => {
      console.error("Failed to mark story as viewed", error);
    },
  });
}

/**
 * Hook to react to a status story.
 */
export function useReactStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storyId, emoji }: { storyId: string; emoji: string }) =>
      statusService.reactStory(storyId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Failed to react to status story", error);
    },
  });
}

/**
 * Hook to reply to a status story.
 */
export function useReplyToStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storyId, message }: { storyId: string; message: string }) =>
      statusService.replyToStory(storyId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Reply sent!");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to send reply";
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a status story.
 */
export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => statusService.deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
      toast.success("Status deleted");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete status";
      toast.error(message);
    },
  });
}
