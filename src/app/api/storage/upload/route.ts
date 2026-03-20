import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const B2_CONFIGURED = !!(
  process.env.B2_KEY_ID &&
  process.env.B2_APP_KEY &&
  process.env.B2_BUCKET_NAME &&
  process.env.B2_REGION &&
  process.env.B2_ENDPOINT
);

const SUPABASE_BUCKET = "attachments";

export async function POST(request: Request) {
  // Verifier l'auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }
    if (!path) {
      return NextResponse.json(
        { error: "Chemin non specifie" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (B2_CONFIGURED) {
      // Upload vers B2 (stockage principal)
      const { uploadToB2 } = await import("@/lib/b2");
      await uploadToB2(path, buffer, file.type || "application/octet-stream");
      const url = `/api/storage/proxy?key=${encodeURIComponent(path)}`;
      return NextResponse.json({ url });
    } else {
      // Fallback : Supabase Storage
      const admin = createAdminClient();

      // Creer le bucket s'il n'existe pas encore
      await admin.storage
        .createBucket(SUPABASE_BUCKET, { public: true })
        .catch(() => {
          /* bucket existe deja */
        });

      const { error: uploadError } = await admin.storage
        .from(SUPABASE_BUCKET)
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = admin.storage.from(SUPABASE_BUCKET).getPublicUrl(path);

      return NextResponse.json({ url: publicUrl });
    }
  } catch (err) {
    console.error("[storage/upload] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 },
    );
  }
}
