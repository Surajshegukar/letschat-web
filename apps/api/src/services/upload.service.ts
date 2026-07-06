import sharp from "sharp";
import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, isS3Enabled } from "@/config/storage";
import { env } from "@/config/env";

export class UploadService {
  /**
   * Process an image buffer and upload it either to AWS S3 or save to local disk.
   */
  async processAndUploadAvatar(
    buffer: Buffer,
    userId: string,
    hostUrl: string
  ): Promise<string> {
    const filename = `avatar-${userId}-${Date.now()}.webp`;

    // Process image with Sharp: resize to 200x200 cover, center-cropped, WebP format
    const processedBuffer = await sharp(buffer)
      .resize(200, 200, { fit: "cover", position: "center" })
      .toFormat("webp")
      .webp({ quality: 85 })
      .toBuffer();

    if (isS3Enabled && s3Client) {
      const bucketName = env.AWS_S3_BUCKET!;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: processedBuffer,
          ContentType: "image/webp",
        })
      );
      return `https://${bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${filename}`;
    } else {
      // Local fallback: save to uploads/avatars/
      const uploadsDir = path.join(process.cwd(), "uploads", "avatars");
      
      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(filePath, processedBuffer);

      // Return server local URL
      return `${hostUrl}/uploads/avatars/${filename}`;
    }
  }

  /**
   * Upload message attachments (images, videos, documents, gifs).
   */
  async uploadMessageAttachment(
    file: Express.Multer.File,
    hostUrl: string
  ): Promise<string> {
    const ext = path.extname(file.originalname);
    const filename = `attachment-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    if (isS3Enabled && s3Client) {
      const bucketName = env.AWS_S3_BUCKET!;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );
      return `https://${bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${filename}`;
    } else {
      const uploadsDir = path.join(process.cwd(), "uploads", "attachments");

      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(filePath, file.buffer);

      return `${hostUrl}/uploads/attachments/${filename}`;
    }
  }
}

export const uploadService = new UploadService();
