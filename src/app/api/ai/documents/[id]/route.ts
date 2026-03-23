import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Verify ownership
  const { data: doc } = await admin
    .from("coach_ai_documents")
    .select("id, coach_id")
    .eq("id", id)
    .single();

  if (!doc || doc.coach_id !== user.id) {
    return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
  }

  // Cascade deletes chunks automatically
  const { error } = await admin
    .from("coach_ai_documents")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
