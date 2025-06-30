import { S3Client } from '@aws-sdk/client-s3';

const endpoint = import.meta.env.CLOUDFLARE_R2_ENDPOINT as string;
const accessKeyId = import.meta.env.CLOUDFLARE_R2_ACCESS_KEY as string;
const secretAccessKey = import.meta.env.CLOUDFLARE_R2_SECRET_KEY as string;
const region = 'auto';

export const r2Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

export const R2_BUCKET = import.meta.env.CLOUDFLARE_R2_BUCKET as string;
export const R2_PUBLIC_BASE = `${endpoint}/${R2_BUCKET}`;
