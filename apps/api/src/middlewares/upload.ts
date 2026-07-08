import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
];
const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/ogg",
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
  "audio/mp4",
];

// Per-category size limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50 MB
const MAX_DOC_SIZE   = 20 * 1024 * 1024;  // 20 MB
const MAX_AUDIO_SIZE = 15 * 1024 * 1024;  // 15 MB

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
  const isDoc   = ALLOWED_DOC_TYPES.includes(file.mimetype);
  const isAudio = ALLOWED_AUDIO_TYPES.includes(file.mimetype);

  if (!isImage && !isVideo && !isDoc && !isAudio) {
    return callback(
      new Error(
        `File type "${file.mimetype}" is not allowed. Accepted: images (JPEG, PNG, WebP, GIF), videos (MP4, WebM, MOV), documents (PDF, DOC, DOCX, TXT, ZIP), audio (WEBM, OGG, MP3, WAV, M4A, AAC).`
      ) as any,
      false
    );
  }

  // Per-type size enforcement (file.size is available after memoryStorage buffers the file,
  // but multer enforces limits.fileSize globally first — we add a secondary guard here)
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return callback(new Error(`Image "${file.originalname}" exceeds the 10 MB size limit.`) as any, false);
  }
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return callback(new Error(`Video "${file.originalname}" exceeds the 50 MB size limit.`) as any, false);
  }
  if (isDoc && file.size > MAX_DOC_SIZE) {
    return callback(new Error(`Document "${file.originalname}" exceeds the 20 MB size limit.`) as any, false);
  }
  if (isAudio && file.size > MAX_AUDIO_SIZE) {
    return callback(new Error(`Audio "${file.originalname}" exceeds the 15 MB size limit.`) as any, false);
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // Global hard cap: 50 MB per file
    files: 10,                   // Max 10 files per request
  },
});

export const uploadSingleAvatar = upload.single("avatar");
