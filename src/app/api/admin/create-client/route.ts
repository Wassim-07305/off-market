import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Only admin and coach can create clients
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "coach") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { email, fullName, phone } = await request.json();

  if (!email || !fullName) {
    return NextResponse.json({ error: "Email et nom requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Create auth user with a temporary password
  const tempPassword = `OffMarket_${Date.now()}!`;
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  // Update profile with additional info
  if (newUser.user) {
    await admin
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        role: "client",
      })
      .eq("id", newUser.user.id);
  }

  return NextResponse.json({ user: newUser.user, tempPassword });
}
