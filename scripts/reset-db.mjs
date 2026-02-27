import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DB_URL) {
  console.error("Missing env vars in .env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL)");
  process.exit(1);
}

const ADMIN_EMAIL = "admin@offmarket.fr";
const ADMIN_PASSWORD = "Admin123456";

async function main() {
  // Step 1: Connect to DB and truncate all public tables
  console.log("\n=== STEP 1: Truncate all public tables ===\n");

  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();
  console.log("Connected to database.");

  const tablesResult = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
  );

  const tables = tablesResult.rows.map((r) => r.tablename);
  console.log("Found " + tables.length + " tables:", tables.join(", "));

  if (tables.length > 0) {
    const truncateSQL =
      "TRUNCATE TABLE " +
      tables.map((t) => 'public."' + t + '"').join(", ") +
      " CASCADE;";
    console.log("\nExecuting: " + truncateSQL + "\n");
    await client.query(truncateSQL);
    console.log("All public tables truncated successfully.");
  } else {
    console.log("No tables found in public schema.");
  }

  await client.end();
  console.log("Database connection closed.");

  // Step 2: Delete all auth users
  console.log("\n=== STEP 2: Delete all auth users ===\n");

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let allUsers = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      console.error("Error listing users:", error.message);
      break;
    }
    allUsers = allUsers.concat(data.users);
    if (data.users.length < perPage) break;
    page++;
  }

  console.log("Found " + allUsers.length + " auth user(s).");

  for (const user of allUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("Failed to delete user " + user.email + " (" + user.id + "):", error.message);
    } else {
      console.log("Deleted user: " + user.email + " (" + user.id + ")");
    }
  }

  console.log("All auth users deleted.");

  // Step 3: Create fresh admin account
  console.log("\n=== STEP 3: Create admin account ===\n");

  const { data: newUser, error: createError } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Admin Off Market" },
    });

  if (createError) {
    console.error("Failed to create admin user:", createError.message);
    process.exit(1);
  }

  console.log("Admin user created: " + newUser.user.email + " (" + newUser.user.id + ")");

  // Step 4: Update profile to set role=admin
  console.log("\n=== STEP 4: Update profile to role=admin ===\n");

  // Wait for the trigger to create the profile
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { data: profile, error: profileCheckError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", newUser.user.id)
    .single();

  if (profileCheckError) {
    console.log(
      "Profile not found by trigger, inserting manually...",
      profileCheckError.message
    );
    const { error: insertError } = await supabase.from("profiles").insert({
      id: newUser.user.id,
      email: ADMIN_EMAIL,
      full_name: "Admin Off Market",
      role: "admin",
    });
    if (insertError) {
      console.error("Failed to insert profile:", insertError.message);
    } else {
      console.log("Profile inserted manually with role=admin.");
    }
  } else {
    console.log("Profile found (created by trigger). Updating role...");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin", full_name: "Admin Off Market" })
      .eq("id", newUser.user.id);
    if (updateError) {
      console.error("Failed to update profile:", updateError.message);
    } else {
      console.log("Profile updated: role=admin, full_name='Admin Off Market'.");
    }
  }

  // Verify
  console.log("\n=== VERIFICATION ===\n");

  const { data: finalProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", newUser.user.id)
    .single();

  console.log("Final profile:", finalProfile);

  const { data: finalUsers } = await supabase.auth.admin.listUsers();
  console.log("Total auth users: " + finalUsers.users.length);
  for (const u of finalUsers.users) {
    console.log("  - " + u.email + " (" + u.id + ")");
  }

  console.log("\n=== DONE ===\n");
  console.log("Login with: " + ADMIN_EMAIL + " / " + ADMIN_PASSWORD);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
