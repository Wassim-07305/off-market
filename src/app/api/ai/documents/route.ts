import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEmbedding } from "@/lib/gemini";
import { extractText, chunkText } from "@/lib/document-ingestion";

// GET — Lister les documents du coach connecte
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Verifier que l'utilisateur est admin ou coach
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Acces interdit" }, { status: 403 });
  }

  const { data: documents, error } = await supabase
    .from("coach_ai_documents")
    .select("*")
    .eq("coach_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur liste documents:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des documents" },
      { status: 500 },
    );
  }

  return NextResponse.json({ documents });
}

// POST — Upload et traitement d'un document (extraction, chunking, embedding)
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Verifier que l'utilisateur est admin ou coach
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Acces interdit" }, { status: 403 });
  }

  const adminClient = createAdminClient();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;

    // Limite a 10 Mo
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier ne doit pas depasser 10 Mo" },
        { status: 400 },
      );
    }

    // 1. Creer le document en status 'processing'
    const { data: doc, error: docError } = await adminClient
      .from("coach_ai_documents")
      .insert({
        coach_id: user.id,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        status: "processing",
        chunk_count: 0,
      })
      .select()
      .single();

    if (docError || !doc) {
      console.error("Erreur creation document:", docError);
      return NextResponse.json(
        { error: "Erreur lors de la creation du document" },
        { status: 500 },
      );
    }

    try {
      // 2. Extraire le texte
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const text = await extractText(buffer, fileType);

      if (!text || text.trim().length === 0) {
        await adminClient
          .from("coach_ai_documents")
          .update({ status: "error" })
          .eq("id", doc.id);

        return NextResponse.json(
          { error: "Impossible d'extraire du texte de ce fichier" },
          { status: 400 },
        );
      }

      // 3. Decouper en chunks
      const chunks = chunkText(text);

      // 4. Generer les embeddings et inserer les chunks
      const chunkRows = [];
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i]);
        chunkRows.push({
          document_id: doc.id,
          coach_id: user.id,
          content: chunks[i],
          embedding: JSON.stringify(embedding),
          chunk_index: i,
          token_count: Math.ceil(chunks[i].length / 4), // Estimation approximative
        });
      }

      const { error: chunkError } = await adminClient
        .from("coach_ai_chunks")
        .insert(chunkRows);

      if (chunkError) {
        console.error("Erreur insertion chunks:", chunkError);
        await adminClient
          .from("coach_ai_documents")
          .update({ status: "error" })
          .eq("id", doc.id);

        return NextResponse.json(
          { error: "Erreur lors de l'indexation du document" },
          { status: 500 },
        );
      }

      // 5. Mettre a jour le document avec le nombre de chunks et status 'ready'
      const { data: updatedDoc, error: updateError } = await adminClient
        .from("coach_ai_documents")
        .update({
          status: "ready",
          chunk_count: chunks.length,
        })
        .eq("id", doc.id)
        .select()
        .single();

      if (updateError) {
        console.error("Erreur mise a jour document:", updateError);
      }

      return NextResponse.json({ document: updatedDoc ?? doc });
    } catch (processingError) {
      console.error("Erreur traitement document:", processingError);
      await adminClient
        .from("coach_ai_documents")
        .update({ status: "error" })
        .eq("id", doc.id);

      return NextResponse.json(
        { error: "Erreur lors du traitement du document" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Erreur upload document:", error);
    return NextResponse.json(
      { error: "Erreur inattendue lors de l'upload" },
      { status: 500 },
    );
  }
}
