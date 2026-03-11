import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DB_URL) {
  console.error(
    "Missing env vars in .env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL)",
  );
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const pool = new pg.Pool({ connectionString: DB_URL });

// Mapping from old seeded IDs to new Admin API IDs (from the first run)
const ID_MAPPING = {
  "a1111111-1111-1111-1111-111111111111":
    "d7299124-625b-4337-849d-b73474fcc8f3", // sophie
  "a2222222-2222-2222-2222-222222222222":
    "e99e9e44-391b-41f8-bfbd-633d3f218678", // lucas
  "a3333333-3333-3333-3333-333333333333":
    "dbbf2093-f17f-4910-88a2-4df92626baf4", // marie
  "a4444444-4444-4444-4444-444444444444":
    "1f293b75-46bc-490c-8407-b2b0d81eb35c", // thomas
  "a5555555-5555-5555-5555-555555555555":
    "57bf2491-43b7-4afd-bfb4-dc2d695dac91", // emma
  "a6666666-6666-6666-6666-666666666666":
    "14c3f658-1e1c-4ae1-8305-1a124c9ce8f7", // hugo
  "a7777777-7777-7777-7777-777777777777":
    "85ade98a-7e4c-4646-8de3-3050fb2ca273", // chloe
  "a8888888-8888-8888-8888-888888888888":
    "1c2e23ec-3d92-4035-bf9b-967f0720978c", // nathan
  "a9999999-9999-9999-9999-999999999999":
    "7b07715a-a313-41cd-9535-9e191bdba25f", // lea
  "aa111111-1111-1111-1111-111111111111":
    "f887512f-c1b0-44a1-a1ff-d269f93e983c", // julien
  "aa222222-2222-2222-2222-222222222222":
    "c99ab383-e0e8-4820-a06e-2c9c82898564", // camille
  "aa333333-3333-3333-3333-333333333333":
    "661587a5-6e41-4a11-99ed-ec47d50268ab", // alex
  "aa444444-4444-4444-4444-444444444444":
    "1d805e18-1296-4a3c-bd76-3f89f6c3ca73", // sarah
  "aa555555-5555-5555-5555-555555555555":
    "dea9c673-bb9a-4bc0-8891-e15d9b9174a0", // maxime
  "aa666666-6666-6666-6666-666666666666":
    "90a6598d-b5d0-4fc3-b9fe-cf4e55999f8c", // ines
};

const EMAIL_MAPPING = {
  "d7299124-625b-4337-849d-b73474fcc8f3": "sophie@offmarket.fr",
  "e99e9e44-391b-41f8-bfbd-633d3f218678": "lucas@offmarket.fr",
  "dbbf2093-f17f-4910-88a2-4df92626baf4": "marie@test.fr",
  "1f293b75-46bc-490c-8407-b2b0d81eb35c": "thomas@test.fr",
  "57bf2491-43b7-4afd-bfb4-dc2d695dac91": "emma@test.fr",
  "14c3f658-1e1c-4ae1-8305-1a124c9ce8f7": "hugo@test.fr",
  "85ade98a-7e4c-4646-8de3-3050fb2ca273": "chloe@test.fr",
  "1c2e23ec-3d92-4035-bf9b-967f0720978c": "nathan@test.fr",
  "7b07715a-a313-41cd-9535-9e191bdba25f": "lea@test.fr",
  "f887512f-c1b0-44a1-a1ff-d269f93e983c": "julien@test.fr",
  "c99ab383-e0e8-4820-a06e-2c9c82898564": "camille@test.fr",
  "661587a5-6e41-4a11-99ed-ec47d50268ab": "alex@test.fr",
  "1d805e18-1296-4a3c-bd76-3f89f6c3ca73": "sarah@test.fr",
  "dea9c673-bb9a-4bc0-8891-e15d9b9174a0": "maxime@test.fr",
  "90a6598d-b5d0-4fc3-b9fe-cf4e55999f8c": "ines@test.fr",
};

const FK_TABLES = [
  { table: "student_details", columns: ["profile_id"] },
  { table: "student_activities", columns: ["student_id"] },
  { table: "student_notes", columns: ["student_id", "author_id"] },
  { table: "student_tasks", columns: ["student_id", "assigned_by"] },
  { table: "channels", columns: ["created_by"] },
  { table: "channel_members", columns: ["profile_id"] },
  { table: "messages", columns: ["sender_id"] },
  { table: "message_reactions", columns: ["profile_id"] },
  { table: "lesson_progress", columns: ["student_id"] },
  { table: "lesson_comments", columns: ["author_id"] },
  { table: "form_submissions", columns: ["respondent_id"] },
  { table: "notifications", columns: ["recipient_id"] },
  { table: "ai_conversations", columns: ["user_id"] },
  { table: "courses", columns: ["created_by"] },
  { table: "forms", columns: ["created_by"] },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log("=== Step 1: Delete auto-created profiles for new_ users ===");
    const newIds = Object.values(ID_MAPPING);
    for (const newId of newIds) {
      // Delete profiles auto-created by handle_new_user trigger
      await client.query("DELETE FROM student_details WHERE profile_id = $1", [
        newId,
      ]);
      await client.query("DELETE FROM profiles WHERE id = $1", [newId]);
    }
    console.log(`  Deleted ${newIds.length} auto-created profiles`);

    console.log("\n=== Step 2: Migrating FK references ===");
    await client.query("BEGIN");
    await client.query("SET session_replication_role = 'replica';");

    for (const [oldId, newId] of Object.entries(ID_MAPPING)) {
      // Update profile ID
      const pResult = await client.query(
        "UPDATE profiles SET id = $1 WHERE id = $2",
        [newId, oldId],
      );
      if (pResult.rowCount > 0) {
        console.log(
          `  profiles: ${oldId.substring(0, 8)}... -> ${newId.substring(0, 8)}...`,
        );
      }

      // Update all FK tables
      for (const fk of FK_TABLES) {
        for (const col of fk.columns) {
          const result = await client.query(
            `UPDATE ${fk.table} SET ${col} = $1 WHERE ${col} = $2`,
            [newId, oldId],
          );
          if (result.rowCount > 0) {
            console.log(`    ${fk.table}.${col}: ${result.rowCount} rows`);
          }
        }
      }
    }

    // Delete old broken auth records
    console.log("\n=== Step 3: Deleting old auth records ===");
    for (const oldId of Object.keys(ID_MAPPING)) {
      await client.query("DELETE FROM auth.identities WHERE user_id = $1", [
        oldId,
      ]);
      await client.query("DELETE FROM auth.sessions WHERE user_id = $1", [
        oldId,
      ]);
      await client.query(
        "DELETE FROM auth.refresh_tokens WHERE instance_id::text = $1",
        [oldId],
      );
      await client.query("DELETE FROM auth.users WHERE id = $1", [oldId]);
    }
    console.log(`  Deleted ${Object.keys(ID_MAPPING).length} old auth users`);

    // Fix emails on new auth users
    console.log("\n=== Step 4: Fixing emails ===");
    for (const [newId, email] of Object.entries(EMAIL_MAPPING)) {
      await client.query("UPDATE auth.users SET email = $1 WHERE id = $2", [
        email,
        newId,
      ]);
      // email column is generated from identity_data->>'email', so only update identity_data
      await client.query(
        `UPDATE auth.identities SET identity_data = identity_data || ('{"email":"' || $1 || '"}')::jsonb WHERE user_id = $2`,
        [email, newId],
      );
      console.log(`  ${email}: OK`);
    }

    await client.query("SET session_replication_role = 'origin';");
    await client.query("COMMIT");
    console.log("\n=== Migration committed! ===");

    // Test auth
    console.log("\n=== Step 5: Testing auth ===");
    const testClient = createClient(
      "https://srhpdgqqiuzdrlqaitdk.supabase.co",
      "sb_publishable_wTbl-J_BGBzPwVY2wsjZ6Q_RcqIxlOh",
    );

    for (const email of [
      "sophie@offmarket.fr",
      "marie@test.fr",
      "lucas@offmarket.fr",
      "thomas@test.fr",
    ]) {
      const { error } = await testClient.auth.signInWithPassword({
        email,
        password: "demo123456",
      });
      console.log(
        `  ${email}: ${error ? `FAIL: ${error.message}` : "SUCCESS"}`,
      );
    }

    // Clean up testuser
    const { rows } = await client.query(
      "SELECT id FROM auth.users WHERE email = 'testuser@offmarket.fr'",
    );
    if (rows.length > 0) {
      await client.query("DELETE FROM student_details WHERE profile_id = $1", [
        rows[0].id,
      ]);
      await client.query("DELETE FROM profiles WHERE id = $1", [rows[0].id]);
      await supabaseAdmin.auth.admin.deleteUser(rows[0].id);
      console.log("\n  Cleaned up testuser@offmarket.fr");
    }

    console.log("\n=== DONE ===");
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    console.error("\nMigration FAILED:", err.message, err.detail || "");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
