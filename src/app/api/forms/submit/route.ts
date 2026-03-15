import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dispatchWebhook } from "@/lib/webhooks";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { formId, answers } = await request.json();

    if (!formId || !answers) {
      return NextResponse.json(
        { error: "formId et answers requis" },
        { status: 400 },
      );
    }

    // Insert the submission
    const { data: submission, error: insertError } = await supabase
      .from("form_submissions")
      .insert({
        form_id: formId,
        respondent_id: user.id,
        answers,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Form submission insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Fetch form details for webhook payload
    const { data: form } = await supabase
      .from("forms")
      .select("id, title")
      .eq("id", formId)
      .single();

    // Fetch respondent info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Dispatch webhook asynchronously (non-blocking)
    dispatchWebhook("form.submitted", {
      form_id: formId,
      form_title: form?.title ?? null,
      submission_id: submission.id,
      respondent: {
        id: user.id,
        name: profile?.full_name ?? null,
        email: profile?.email ?? null,
      },
      answers,
      submitted_at: submission.submitted_at ?? new Date().toISOString(),
    }).catch((err) => {
      console.error("Webhook dispatch error (form.submitted):", err);
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Form submit API error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission du formulaire" },
      { status: 500 },
    );
  }
}
