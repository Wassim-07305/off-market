import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFromB2 } from "@/lib/b2";
import { createAdminClient } from "@/lib/supabase/admin";

const B2_CONFIGURED = !!(
  process.env.B2_KEY_ID &&
  process.env.B2_APP_KEY &&
  process.env.B2_BUCKET_NAME &&
  process.env.B2_REGION &&
  process.env.B2_ENDPOINT
);

const SUPABASE_BUCKET = "attachments";

export async function DELETE(request: Request) {
  // Verifier l'auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const { key } = (await request.json()) as { key?: string };

    if (!key) {
      return NextResponse.json(
        { error: "Parametre 'key' manquant" },
        { status: 400 },
      );
    }

    if (B2_CONFIGURED) {
      await deleteFromB2(key);
    } else {
      // Fallback: delete from Supabase storage
      const admin = createAdminClient();
      const { error } = await admin.storage
        .from(SUPABASE_BUCKET)
        .remove([key]);
      if (error) {
        console.error("[storage/delete] Supabase delete error:", error);
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[storage/delete] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
