import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB (Whisper limit)

function getOpenAIKey(): string | null {
  return process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || null;
}

export async function POST(request: Request) {
  // 1. Check API key availability
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Transcription indisponible : aucune cle API OpenAI configuree (OPENAI_API_KEY ou OPENROUTER_API_KEY)",
      },
      { status: 503 },
    );
  }

  // 2. Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // 3. Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Le corps de la requete doit etre un FormData valide" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Un fichier audio est requis (champ 'file')" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `Le fichier est trop volumineux (${Math.round(file.size / 1024 / 1024)} Mo). Limite : 25 Mo.`,
      },
      { status: 400 },
    );
  }

  // Optional: call_id to save the transcription to DB
  const callId = formData.get("call_id") as string | null;

  try {
    // 4. Forward to OpenAI Whisper API
    const whisperForm = new FormData();
    whisperForm.append("file", file);
    whisperForm.append("model", "whisper-1");
    whisperForm.append("language", "fr");
    whisperForm.append("response_format", "verbose_json");

    const whisperResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: whisperForm,
      },
    );

    if (!whisperResponse.ok) {
      const errorBody = await whisperResponse.text();
      console.error("Whisper API error:", whisperResponse.status, errorBody);
      return NextResponse.json(
        { error: "Erreur lors de la transcription audio" },
        { status: 502 },
      );
    }

    const result = await whisperResponse.json();

    const transcriptionText: string = result.text ?? "";
    const duration: number | undefined = result.duration;
    const segments: Array<{
      start: number;
      end: number;
      text: string;
    }> | undefined = result.segments?.map(
      (s: { start: number; end: number; text: string }) => ({
        start: s.start,
        end: s.end,
        text: s.text,
      }),
    );

    // 5. Optionally save to call_transcripts if call_id provided
    if (callId) {
      const content = segments
        ? segments.map((s) => ({
            speaker_id: user.id,
            speaker_name: "Transcription Whisper",
            text: s.text.trim(),
            timestamp_ms: Math.round(s.start * 1000),
          }))
        : [
            {
              speaker_id: user.id,
              speaker_name: "Transcription Whisper",
              text: transcriptionText,
              timestamp_ms: 0,
            },
          ];

      const { error: saveError } = await supabase
        .from("call_transcripts")
        .insert({
          call_id: callId,
          content: JSON.stringify(content),
          language: "fr",
          duration_seconds: duration ? Math.round(duration) : undefined,
        });

      if (saveError) {
        console.error("Error saving transcription:", saveError);
        // Still return the text even if save fails
      }
    }

    return NextResponse.json({
      text: transcriptionText,
      segments,
      duration,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la transcription" },
      { status: 500 },
    );
  }
}
