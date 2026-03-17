/**
 * Script de migration Supabase Storage → Backblaze B2 (fichiers) + YouTube (vidéos)
 *
 * Usage : npx tsx scripts/migrate-storage.ts
 *
 * Idempotent : ne re-migre pas les fichiers dont l'URL en DB pointe déjà vers B2/YouTube.
 * Séquentiel : un fichier à la fois.
 * Non-destructif : ne supprime rien de Supabase Storage.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { google } from "googleapis";
import { Readable } from "node:stream";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
  details: string[];
}

interface FileEntry {
  bucket: string;
  path: string; // chemin relatif dans le bucket
  fullKey: string; // bucket/path — clé dans B2
}

type Destination = "b2" | "youtube";

// Colonnes DB à mettre à jour
interface DbColumn {
  table: string;
  column: string;
}

const DB_COLUMNS: DbColumn[] = [
  { table: "profiles", column: "avatar_url" },
  { table: "courses", column: "cover_image_url" },
  { table: "lessons", column: "video_url" },
  { table: "messages", column: "content" },
  { table: "message_attachments", column: "file_url" },
  { table: "branding_settings", column: "logo_url" },
  { table: "branding_settings", column: "background_url" },
  { table: "branding_settings", column: "welcome_video_url" },
  { table: "resources", column: "file_url" },
];

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".webm", ".mkv"];
const SUPABASE_STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL}/storage/v1/object/public`;

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  // Essayer les deux préfixes (VITE_ pour ce projet, NEXT_PUBLIC_ si défini)
  const val =
    process.env[name] ??
    process.env[name.replace("VITE_", "NEXT_PUBLIC_")] ??
    process.env[name.replace("NEXT_PUBLIC_", "VITE_")];
  if (!val) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return val;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) throw new Error("VITE_SUPABASE_URL manquante");

const supabaseServiceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const s3 = new S3Client({
  endpoint: requireEnv("B2_ENDPOINT"),
  region: requireEnv("B2_REGION"),
  credentials: {
    accessKeyId: requireEnv("B2_KEY_ID"),
    secretAccessKey: requireEnv("B2_APP_KEY"),
  },
  forcePathStyle: true, // requis pour B2
});

const B2_BUCKET = requireEnv("B2_BUCKET_NAME");
const B2_ENDPOINT = requireEnv("B2_ENDPOINT");

// YouTube — optionnel
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN?.trim() || null;
let youtube: ReturnType<typeof google.youtube> | null = null;

if (YOUTUBE_REFRESH_TOKEN) {
  const oauth2Client = new google.auth.OAuth2(
    requireEnv("YOUTUBE_CLIENT_ID"),
    requireEnv("YOUTUBE_CLIENT_SECRET"),
  );
  oauth2Client.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });
  youtube = google.youtube({ version: "v3", auth: oauth2Client });
  console.log("✓ YouTube client initialisé");
} else {
  console.log(
    "⚠ YOUTUBE_REFRESH_TOKEN non défini — les vidéos seront skippées",
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isVideo(filename: string): boolean {
  const lower = filename.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function getDestination(filename: string): Destination {
  return isVideo(filename) && youtube ? "youtube" : "b2";
}

function b2Url(key: string): string {
  return `${B2_ENDPOINT}/${B2_BUCKET}/${key}`;
}

function supabasePublicUrl(bucket: string, path: string): string {
  return `${SUPABASE_STORAGE_BASE}/${bucket}/${path}`;
}

/** Liste récursive de tous les fichiers d'un bucket Supabase Storage */
async function listBucketFiles(
  bucket: string,
  prefix = "",
): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });

  if (error) {
    console.error(`  Erreur listing ${bucket}/${prefix}: ${error.message}`);
    return entries;
  }

  if (!data) return entries;

  for (const item of data) {
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

    if (item.id === null || item.metadata === undefined) {
      // C'est un dossier — descendre
      const sub = await listBucketFiles(bucket, itemPath);
      entries.push(...sub);
    } else {
      entries.push({
        bucket,
        path: itemPath,
        fullKey: `${bucket}/${itemPath}`,
      });
    }
  }

  return entries;
}

/** Télécharge un fichier depuis Supabase Storage */
async function downloadFromSupabase(
  bucket: string,
  path: string,
): Promise<{ data: Buffer; contentType: string }> {
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error(
      `Échec download ${bucket}/${path}: ${error?.message ?? "no data"}`,
    );
  }

  const arrayBuffer = await data.arrayBuffer();
  const contentType = data.type || "application/octet-stream";

  return { data: Buffer.from(arrayBuffer), contentType };
}

/** Upload vers B2 via S3 */
async function uploadToB2(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: B2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return b2Url(key);
}

/** Upload vers YouTube en unlisted */
async function uploadToYouTube(
  filename: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  if (!youtube) throw new Error("YouTube client non initialisé");

  const title = filename
    .replace(/\.[^.]+$/, "") // retirer extension
    .replace(/[-_]/g, " ") // tirets/underscores → espaces
    .slice(0, 100);

  const stream = new Readable();
  stream.push(body);
  stream.push(null);

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description: `Migré depuis Supabase Storage — Off-Market`,
        categoryId: "27", // Education
      },
      status: {
        privacyStatus: "unlisted",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      mimeType: contentType,
      body: stream,
    },
  });

  const videoId = res.data.id;
  if (!videoId) throw new Error("YouTube upload réussi mais pas de video ID");

  return `youtube:${videoId}`;
}

/** Vérifie si un fichier existe déjà sur B2 */
async function existsOnB2(key: string): Promise<boolean> {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: B2_BUCKET,
        Key: key,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

/** Remplace les anciennes URLs Supabase par les nouvelles dans la DB */
async function updateDbUrls(oldUrl: string, newUrl: string): Promise<number> {
  let totalUpdated = 0;

  for (const { table, column } of DB_COLUMNS) {
    try {
      // Pour les colonnes texte qui peuvent contenir l'URL (comme messages.content),
      // on utilise un UPDATE avec LIKE
      const { data, error } = await supabase.rpc("exec_sql", {
        query: `
          UPDATE "${table}"
          SET "${column}" = REPLACE("${column}", '${oldUrl.replace(/'/g, "''")}', '${newUrl.replace(/'/g, "''")}')
          WHERE "${column}" LIKE '%${oldUrl.replace(/'/g, "''")}%'
        `,
      });

      // Fallback si la fonction RPC n'existe pas : utiliser l'API REST
      if (error) {
        // Essayer via l'API REST — sélectionner les rows qui contiennent l'URL
        const { data: rows, error: selectErr } = await supabase
          .from(table)
          .select("id, " + column)
          .like(column, `%${oldUrl}%`);

        if (selectErr) {
          // Table ou colonne n'existe probablement pas, on skip silencieusement
          continue;
        }

        if (rows && rows.length > 0) {
          for (const row of rows) {
            const oldValue = (row as Record<string, string>)[column];
            const newValue = oldValue.replace(oldUrl, newUrl);
            const { error: updateErr } = await supabase
              .from(table)
              .update({ [column]: newValue })
              .eq("id", row.id);

            if (!updateErr) totalUpdated++;
          }
        }
      } else {
        // RPC a fonctionné
        totalUpdated++;
      }
    } catch {
      // Table/colonne inexistante, on continue
      continue;
    }
  }

  return totalUpdated;
}

/** Vérifie si l'URL Supabase est encore référencée en DB */
async function isUrlStillInDb(oldUrl: string): Promise<boolean> {
  for (const { table, column } of DB_COLUMNS) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("id")
        .like(column, `%${oldUrl}%`)
        .limit(1);

      if (!error && data && data.length > 0) return true;
    } catch {
      continue;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Migration principale
// ---------------------------------------------------------------------------

const BUCKETS_TO_MIGRATE = [
  "avatars",
  "course-assets",
  "message-attachments",
  "branding",
  // form-uploads est vide
];

async function migrate(): Promise<void> {
  console.log("═══════════════════════════════════════════════");
  console.log("  Migration Supabase Storage → B2 / YouTube");
  console.log("═══════════════════════════════════════════════\n");

  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  // Collecter tous les fichiers
  const allFiles: FileEntry[] = [];
  for (const bucket of BUCKETS_TO_MIGRATE) {
    console.log(`📂 Listing bucket "${bucket}"...`);
    const files = await listBucketFiles(bucket);
    console.log(`   → ${files.length} fichier(s) trouvé(s)`);
    allFiles.push(...files);
  }

  stats.total = allFiles.length;
  console.log(`\n📊 Total : ${stats.total} fichiers à traiter\n`);

  if (stats.total === 0) {
    console.log("Rien à migrer.");
    return;
  }

  // Migrer un par un
  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const idx = `[${i + 1}/${stats.total}]`;
    const oldUrl = supabasePublicUrl(file.bucket, file.path);
    const dest = getDestination(file.path);

    try {
      // Vérifier si déjà migré (URL n'est plus en DB)
      const stillInDb = await isUrlStillInDb(oldUrl);

      if (!stillInDb) {
        // L'URL Supabase n'est plus en DB → probablement déjà migré ou pas référencé
        // Vérifier aussi si le fichier existe déjà sur B2
        if (dest === "b2") {
          const alreadyOnB2 = await existsOnB2(file.fullKey);
          if (alreadyOnB2) {
            console.log(`${idx} ⏭ ${file.fullKey} — déjà sur B2`);
            stats.skipped++;
            continue;
          }
        }

        // Fichier pas référencé en DB mais pas encore sur B2 → migrer quand même vers B2
        // (sauf YouTube — on ne peut pas vérifier facilement si déjà uploadé)
        if (dest === "youtube") {
          console.log(
            `${idx} ⏭ ${file.fullKey} — vidéo non référencée en DB, skip`,
          );
          stats.skipped++;
          continue;
        }
      }

      // Skip vidéos si pas de YouTube
      if (dest === "youtube" && !youtube) {
        console.log(`${idx} ⏭ ${file.fullKey} — vidéo, YouTube non configuré`);
        stats.skipped++;
        continue;
      }

      // Télécharger depuis Supabase
      console.log(`${idx} ↓ Téléchargement de ${file.fullKey}...`);
      const { data: fileData, contentType } = await downloadFromSupabase(
        file.bucket,
        file.path,
      );

      let newUrl: string;

      if (dest === "youtube") {
        // Upload vers YouTube
        console.log(`${idx} ↑ Upload vers YouTube...`);
        newUrl = await uploadToYouTube(file.path, fileData, contentType);
        console.log(`${idx} ✓ ${file.fullKey} → YouTube (${newUrl})`);
      } else {
        // Upload vers B2
        console.log(`${idx} ↑ Upload vers B2...`);
        newUrl = await uploadToB2(file.fullKey, fileData, contentType);
        console.log(`${idx} ✓ ${file.fullKey} → B2`);
      }

      // Mettre à jour les URLs en DB
      if (stillInDb) {
        const updated = await updateDbUrls(oldUrl, newUrl);
        if (updated > 0) {
          console.log(`${idx}   DB: ${updated} référence(s) mise(s) à jour`);
        }
      }

      stats.migrated++;
      stats.details.push(`✓ ${file.fullKey} → ${dest.toUpperCase()}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${idx} ✗ ${file.fullKey} — ERREUR: ${msg}`);
      stats.errors++;
      stats.details.push(`✗ ${file.fullKey} — ${msg}`);
    }
  }

  // Résumé
  console.log("\n═══════════════════════════════════════════════");
  console.log("  RÉSUMÉ DE LA MIGRATION");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Total fichiers   : ${stats.total}`);
  console.log(`  Migrés           : ${stats.migrated}`);
  console.log(`  Skippés          : ${stats.skipped}`);
  console.log(`  Erreurs          : ${stats.errors}`);
  console.log("═══════════════════════════════════════════════\n");

  if (stats.errors > 0) {
    console.log("Fichiers en erreur :");
    stats.details
      .filter((d) => d.startsWith("✗"))
      .forEach((d) => console.log(`  ${d}`));
    console.log("");
  }

  if (stats.migrated > 0) {
    console.log("Fichiers migrés :");
    stats.details
      .filter((d) => d.startsWith("✓"))
      .forEach((d) => console.log(`  ${d}`));
    console.log("");
  }

  process.exit(stats.errors > 0 ? 1 : 0);
}

// ---------------------------------------------------------------------------
// Exécution
// ---------------------------------------------------------------------------

migrate().catch((err) => {
  console.error("Erreur fatale :", err);
  process.exit(1);
});
