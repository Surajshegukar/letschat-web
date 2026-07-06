export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_DOC_SIZE = 20 * 1024 * 1024;   // 20 MB
export const MAX_FILE_COUNT = 10;

export function validateFiles(files: File[]): string | null {
  if (files.length > MAX_FILE_COUNT) {
    return `You can share at most ${MAX_FILE_COUNT} files at a time.`;
  }
  for (const file of files) {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const isDoc = ALLOWED_DOC_TYPES.includes(file.type);

    if (!isImage && !isVideo && !isDoc) {
      return `"${file.name}" has an unsupported file type. Allowed: images (JPEG, PNG, WebP, GIF), videos (MP4, WebM, MOV), documents (PDF, DOC, DOCX, TXT, ZIP).`;
    }
    if (isImage && file.size > MAX_IMAGE_SIZE) return `"${file.name}" exceeds the 10 MB limit for images.`;
    if (isVideo && file.size > MAX_VIDEO_SIZE) return `"${file.name}" exceeds the 50 MB limit for videos.`;
    if (isDoc && file.size > MAX_DOC_SIZE) return `"${file.name}" exceeds the 20 MB limit for documents.`;
  }
  return null;
}
