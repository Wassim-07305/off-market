import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

const B2_KEY_ID = process.env.B2_KEY_ID!;
const B2_APP_KEY = process.env.B2_APP_KEY!;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME!;
const B2_REGION = process.env.B2_REGION!;
const B2_ENDPOINT = process.env.B2_ENDPOINT!;

let client: S3Client | null = null;

/** Retourne un singleton S3Client configure pour Backblaze B2 */
export function getB2Client(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: B2_ENDPOINT,
      region: B2_REGION,
      credentials: {
        accessKeyId: B2_KEY_ID,
        secretAccessKey: B2_APP_KEY,
      },
      forcePathStyle: true,
    });
  }
  return client;
}

/** Upload un fichier vers B2 */
export async function uploadToB2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  const s3 = getB2Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/** Genere un signed URL pour acceder a un fichier prive (defaut 4h) */
export async function getSignedUrl(
  key: string,
  expiresIn = 14400,
): Promise<string> {
  const s3 = getB2Client();
  const command = new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
  });
  return awsGetSignedUrl(s3, command, { expiresIn });
}

/** Supprime un fichier de B2 */
export async function deleteFromB2(key: string): Promise<void> {
  const s3 = getB2Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: key,
    }),
  );
}

/** Retourne l'URL publique d'un fichier B2 (pour buckets publics) */
export function getPublicB2Url(key: string): string {
  return `${B2_ENDPOINT}/${B2_BUCKET_NAME}/${key}`;
}
