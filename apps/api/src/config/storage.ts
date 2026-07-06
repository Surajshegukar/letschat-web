import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/config/env";

const hasS3Creds =
  env.AWS_ACCESS_KEY_ID &&
  env.AWS_SECRET_ACCESS_KEY &&
  env.AWS_REGION &&
  env.AWS_S3_BUCKET;

export const s3Client = hasS3Creds
  ? new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export const isS3Enabled = !!s3Client;
