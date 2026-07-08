import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

/**
 * Extracts the first HTTP/HTTPS URL from a string, or null if none.
 */
export function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  return match ? match[0] : null;
}

/**
 * React Query hook that fetches Open Graph metadata for a URL via the backend scraper.
 * Cached for 1 hour to avoid redundant requests.
 */
export function useLinkPreview(url: string | null) {
  return useQuery<LinkPreviewData | null>({
    queryKey: ["link-preview", url],
    queryFn: async () => {
      if (!url) return null;
      const response = await api.get("/meta", {
        params: { url },
      });
      const data: LinkPreviewData = response.data.data;
      // Treat as "no preview" if there is nothing meaningful to show
      if (!data.title && !data.image && !data.description) return null;
      return data;
    },
    enabled: !!url,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false,
    refetchOnWindowFocus: false,
  });
}
