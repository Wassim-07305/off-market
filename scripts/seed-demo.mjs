import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createUser(email, fullName, role, password = "Demo123456") {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error && !error.message.includes("already been registered")) {
    console.error(`Error creating ${email}:`, error.message);
    return null;
  }
  if (data?.user) {
    await admin
      .from("profiles")
      .update({ full_name: fullName, role, bio: `Compte demo ${role}` })
      .eq("id", data.user.id);
    console.log(`Created ${role}: ${email}`);
    return data.user.id;
  }
  // User already exists, get their id
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  return existing?.id ?? null;
}

async function seed() {
  console.log("Seeding demo data...\n");

  // 1. Create users
  const coachId = await createUser(
    "coach@offmarket.fr",
    "Sophie Martin",
    "coach",
  );
  const setterId = await createUser(
    "setter@offmarket.fr",
    "Lucas Dubois",
    "setter",
  );
  const client1Id = await createUser(
    "marie@client.fr",
    "Marie Leroy",
    "client",
  );
  const client2Id = await createUser(
    "pierre@client.fr",
    "Pierre Bernard",
    "client",
  );
  const client3Id = await createUser("emma@client.fr", "Emma Petit", "client");

  // Get admin id
  const { data: adminProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .single();
  const adminId = adminProfile?.id;

  if (!adminId) {
    console.error("No admin found! Create admin first.");
    return;
  }

  // 2. Create a course with modules and lessons
  console.log("\nCreating courses...");
  const { data: course } = await admin
    .from("courses")
    .insert({
      title: "Freelance: De 0 a 5K/mois",
      description:
        "Formation complete pour lancer ton activite freelance et atteindre 5K EUR/mois.",
      status: "published",
      is_published: true,
      created_by: adminId,
    })
    .select()
    .single();

  if (course) {
    const { data: mod1 } = await admin
      .from("modules")
      .insert({
        course_id: course.id,
        title: "Module 1: Les Fondamentaux",
        sort_order: 0,
      })
      .select()
      .single();

    if (mod1) {
      await admin.from("lessons").insert([
        {
          module_id: mod1.id,
          title: "Choisir sa niche",
          content_type: "video",
          content: {
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          },
          sort_order: 0,
        },
        {
          module_id: mod1.id,
          title: "Definir son offre",
          content_type: "text",
          content: {
            html: "<h2>Comment definir ton offre</h2><p>L'offre est la base de tout. Sans offre claire, pas de client. Voici les 3 etapes...</p><ul><li>Identifie le probleme que tu resous</li><li>Cree une promesse de resultat</li><li>Fixe un prix base sur la valeur</li></ul>",
          },
          sort_order: 1,
        },
        {
          module_id: mod1.id,
          title: "Fixer ses tarifs",
          content_type: "text",
          content: {
            html: "<h2>La strategie de prix</h2><p>Ne vends jamais a l'heure. Vends un resultat. Voici les methodes de pricing les plus efficaces pour les freelances...</p>",
          },
          sort_order: 2,
        },
      ]);
    }

    const { data: mod2 } = await admin
      .from("modules")
      .insert({
        course_id: course.id,
        title: "Module 2: Acquisition",
        sort_order: 1,
      })
      .select()
      .single();

    if (mod2) {
      await admin.from("lessons").insert([
        {
          module_id: mod2.id,
          title: "Prospection LinkedIn",
          content_type: "video",
          content: {
            url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
            video_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
          },
          sort_order: 0,
        },
        {
          module_id: mod2.id,
          title: "Cold Email qui convertit",
          content_type: "text",
          content: {
            html: "<h2>L'art du cold email</h2><p>Un bon cold email fait 3-4 lignes. Il est personnalise, il montre que tu comprends le probleme du prospect, et il propose un appel de 15 min.</p>",
          },
          sort_order: 1,
        },
      ]);
    }
    console.log("Course created with 2 modules and 5 lessons");
  }

  // 3. Create channels and messages
  console.log("\nCreating channels and messages...");
  const { data: generalChannel } = await admin
    .from("channels")
    .insert({
      name: "general",
      type: "public",
      created_by: adminId,
    })
    .select()
    .single();

  if (generalChannel) {
    const memberIds = [
      adminId,
      coachId,
      client1Id,
      client2Id,
      client3Id,
    ].filter(Boolean);
    await admin.from("channel_members").insert(
      memberIds.map((id) => ({
        channel_id: generalChannel.id,
        profile_id: id,
        role: id === adminId ? "admin" : "member",
      })),
    );

    await admin.from("messages").insert([
      {
        channel_id: generalChannel.id,
        sender_id: adminId,
        content:
          "Bienvenue sur Off Market ! N'hesitez pas a poser vos questions ici.",
      },
      {
        channel_id: generalChannel.id,
        sender_id: client1Id,
        content: "Merci ! Hate de commencer la formation.",
      },
      {
        channel_id: generalChannel.id,
        sender_id: coachId,
        content:
          "Bienvenue Marie ! Je suis ton coach, n'hesite pas si tu as besoin d'aide.",
      },
      {
        channel_id: generalChannel.id,
        sender_id: client2Id,
        content:
          "Salut tout le monde ! Pierre ici, je me lance en freelance web dev.",
      },
      {
        channel_id: generalChannel.id,
        sender_id: client3Id,
        content: "Hello ! Emma, freelance graphiste. Contente d'etre la !",
      },
    ]);
    console.log("Channel 'general' created with 5 messages");
  }

  // 4. Create some invoices
  console.log("\nCreating invoices...");
  if (client1Id && client2Id) {
    await admin.from("invoices").insert([
      {
        invoice_number: "OM-2026-0001",
        client_id: client1Id,
        amount: 2000,
        tax: 400,
        total: 2400,
        status: "paid",
        due_date: "2026-01-15",
      },
      {
        invoice_number: "OM-2026-0002",
        client_id: client2Id,
        amount: 2000,
        tax: 400,
        total: 2400,
        status: "paid",
        due_date: "2026-01-20",
      },
      {
        invoice_number: "OM-2026-0003",
        client_id: client1Id,
        amount: 2000,
        tax: 400,
        total: 2400,
        status: "paid",
        due_date: "2026-02-15",
      },
      {
        invoice_number: "OM-2026-0004",
        client_id: client3Id,
        amount: 1500,
        tax: 300,
        total: 1800,
        status: "sent",
        due_date: "2026-03-01",
      },
    ]);
    console.log("4 invoices created");
  }

  // 5. Create some weekly check-ins
  console.log("\nCreating check-ins...");
  if (client1Id) {
    await admin.from("weekly_checkins").insert([
      {
        client_id: client1Id,
        week_start: "2026-02-10",
        revenue: 1200,
        prospection_count: 15,
        win: "Signe un client a 2000 EUR !",
        blocker: "Difficulte a trouver du temps pour prospecter",
        goal_next_week: "Envoyer 20 cold emails",
        mood: 4,
      },
      {
        client_id: client1Id,
        week_start: "2026-02-17",
        revenue: 800,
        prospection_count: 22,
        win: "3 appels decouverte cette semaine",
        blocker: "Un prospect a ghost",
        goal_next_week: "Closer au moins 1 deal",
        mood: 3,
      },
    ]);
    console.log("2 check-ins created");
  }

  // 6. Create call calendar entries
  console.log("\nCreating calls...");
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  await admin.from("call_calendar").insert([
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
      assigned_to: coachId,
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
  ]);
  console.log("4 calls created");

  // 7. Create feed posts
  console.log("\nCreating feed posts...");
  if (client1Id) {
    await admin.from("feed_posts").insert([
      {
        author_id: client1Id,
        content:
          "Je viens de signer mon premier client a 2000 EUR ! Merci a la formation Off Market, les techniques de cold email marchent vraiment. Hate de continuer !",
        post_type: "victory",
        likes_count: 3,
      },
      {
        author_id: client2Id,
        content:
          "Question pour les devs: est-ce que vous proposez de la maintenance en plus de vos prestations ? Comment vous structurez ca ?",
        post_type: "question",
        likes_count: 1,
      },
      {
        author_id: client3Id,
        content:
          "Premier mois en freelance termine. 1500 EUR de CA. C'est pas encore l'objectif mais c'est un debut. On lache rien !",
        post_type: "experience",
        likes_count: 5,
      },
    ]);
    console.log("3 feed posts created");
  }

  console.log("\n✅ Seed complete!");
  console.log("\nComptes de demo:");
  console.log("  Admin:   admin@offmarket.fr / Admin123456");
  console.log("  Coach:   coach@offmarket.fr / Demo123456");
  console.log("  Setter:  setter@offmarket.fr / Demo123456");
  console.log("  Client:  marie@client.fr / Demo123456");
  console.log("  Client:  pierre@client.fr / Demo123456");
  console.log("  Client:  emma@client.fr / Demo123456");
}

seed().catch(console.error);
