import { Request, Response } from "express";

interface MetaResult {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

// In-memory cache: url -> { data, expiresAt }
const cache = new Map<string, { data: MetaResult; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getMetaTag(html: string, property: string): string | undefined {
  // Match og: and name= meta tags
  const ogMatch = html.match(
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    )
  );
  if (ogMatch?.[1]) return ogMatch[1];

  const nameMatch = html.match(
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i"
    )
  );
  return nameMatch?.[1];
}

function getNameTag(html: string, name: string): string | undefined {
  const match = html.match(
    new RegExp(
      `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i"
    )
  );
  if (match?.[1]) return match[1];

  const match2 = html.match(
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`,
      "i"
    )
  );
  return match2?.[1];
}

function getTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim();
}

function getFaviconUrl(html: string, baseUrl: string): string {
  // Try <link rel="icon"> or <link rel="shortcut icon">
  const match = html.match(
    /<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+href=["']([^"']+)["']/i
  );
  if (match?.[1]) {
    const href = match[1];
    if (href.startsWith("http")) return href;
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return `${new URL(baseUrl).origin}/favicon.ico`;
    }
  }
  try {
    return `${new URL(baseUrl).origin}/favicon.ico`;
  } catch {
    return "";
  }
}

export async function getMetaPreview(req: Request, res: Response): Promise<void> {
  const rawUrl = req.query.url as string;

  if (!rawUrl || !/^https?:\/\/.+/.test(rawUrl)) {
    res.status(400).json({ status: "error", message: "Invalid or missing url parameter" });
    return;
  }

  // Normalise & validate URL
  let targetUrl: string;
  try {
    targetUrl = new URL(rawUrl).toString();
  } catch {
    res.status(400).json({ status: "error", message: "Malformed URL" });
    return;
  }

  // Serve from cache if still fresh
  const cached = cache.get(targetUrl);
  if (cached && cached.expiresAt > Date.now()) {
    res.json({ status: "success", data: cached.data });
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LetsChatBot/1.0; +https://letschat.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      res.status(200).json({ status: "success", data: { url: targetUrl } });
      return;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      // Binary or JSON resource — return minimal metadata
      res.json({ status: "success", data: { url: targetUrl } });
      return;
    }

    // Read only the first 100 KB to keep things fast
    const reader = response.body?.getReader();
    let html = "";
    if (reader) {
      let totalBytes = 0;
      while (totalBytes < 100_000) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        html += new TextDecoder().decode(value);
        totalBytes += value.byteLength;
      }
      reader.cancel();
    }

    const result: MetaResult = {
      url: targetUrl,
      title:
        getMetaTag(html, "og:title") ||
        getNameTag(html, "title") ||
        getTitleTag(html),
      description:
        getMetaTag(html, "og:description") ||
        getNameTag(html, "description"),
      image: getMetaTag(html, "og:image"),
      siteName:
        getMetaTag(html, "og:site_name") ||
        new URL(targetUrl).hostname.replace(/^www\./, ""),
      favicon: getFaviconUrl(html, targetUrl),
    };

    // Cache the result
    cache.set(targetUrl, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

    // Trim cache to 500 entries to avoid memory leaks
    if (cache.size > 500) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    res.json({ status: "success", data: result });
  } catch (err: any) {
    // Timeout or network error — return empty preview rather than an error
    res.status(200).json({ status: "success", data: { url: targetUrl } });
  }
}
