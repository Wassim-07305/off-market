import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  // Get admin id
  const { data: adminProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .single();
  const adminId = adminProfile?.id;

  if (!adminId) {
    console.error("No admin found!");
    return;
  }

  // Get coach id
  const { data: coachProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", "coach@offmarket.fr")
    .single();
  const coachId = coachProfile?.id;

  // Get setter id
  const { data: setterProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", "setter@offmarket.fr")
    .single();
  const setterId = setterProfile?.id;

  // Get clients
  const { data: clients } = await admin
    .from("profiles")
    .select("id, email")
    .eq("role", "client");

  const client1Id = clients?.find((c) => c.email === "marie@client.fr")?.id;
  const client2Id = clients?.find((c) => c.email === "pierre@client.fr")?.id;
  const client3Id = clients?.find((c) => c.email === "emma@client.fr")?.id;

  // First check if table is accessible
  const { error: tableCheck } = await admin.from("call_calendar").select("id").limit(1);
  if (tableCheck) {
    console.error("call_calendar table not accessible:", tableCheck.message);
    console.error("Run the fix-call-calendar.sql in the Supabase SQL Editor first!");
    return;
  }

  // Create calls
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const { data, error } = await admin.from("call_calendar").insert([
    {
      title: "Appel decouverte - Marie",
      client_id: client1Id,
      assigned_to: adminId,
      date: today,
      time: "10:00",
      duration_minutes: 30,
      call_type: "iclosed",
      status: "planifie",
      link: "https://meet.google.com/abc-defg-hij",
      notes: "Premier appel avec Marie, voir ses objectifs",
    },
    {
      title: "Suivi hebdo - Pierre",
      client_id: client2Id,
      assigned_to: coachId ?? adminId,
      date: today,
      time: "14:00",
      duration_minutes: 45,
      call_type: "manuel",
      status: "planifie",
    },
    {
      title: "Closing Emma",
      client_id: client3Id,
      assigned_to: setterId ?? adminId,
      date: tomorrow,
      time: "11:00",
      duration_minutes: 30,
      call_type: "iclosed",
      status: "planifie",
      link: "https://meet.google.com/xyz-uvwx-yz",
    },
    {
      title: "Appel Calendly automatique",
      assigned_to: adminId,
      date: tomorrow,
      time: "16:00",
      duration_minutes: 30,
      call_type: "calendly",
      status: "planifie",
    },
  ]).select();

  if (error) {
    console.error("Error seeding calls:", error.message);
  } else {
    console.log(`${data.length} calls created successfully!`);
  }
}

seed().catch(console.error);
