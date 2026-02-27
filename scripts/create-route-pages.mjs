/**
 * Creates thin re-export page.tsx files in each route group
 * that import from _shared-pages.
 */
import fs from "fs";
import path from "path";

const APP_DIR = "/Users/wassim/Projets/Off-Market/src/app";

// Mapping: which pages go in which route group
const routeGroups = {
  "(admin)": [
    "dashboard",
    "crm",
    "crm/[id]",
    "messaging",
    "school",
    "school/[courseId]",
    "school/[courseId]/[lessonId]",
    "school/builder",
    "school/builder/[courseId]",
    "forms",
    "forms/[formId]",
    "forms/[formId]/respond",
    "forms/builder",
    "forms/builder/[formId]",
    "ai",
    "analytics",
    "settings",
  ],
  "(coach)": [
    "dashboard",
    "crm",
    "crm/[id]",
    "messaging",
    "school",
    "school/[courseId]",
    "school/[courseId]/[lessonId]",
    "settings",
  ],
  "(sales)": [
    "dashboard",
    "messaging",
    "settings",
  ],
  "(client)": [
    "dashboard",
    "school",
    "school/[courseId]",
    "school/[courseId]/[lessonId]",
    "messaging",
    "forms",
    "forms/[formId]",
    "forms/[formId]/respond",
    "settings",
  ],
};

// Special page: messaging/[channelId] needs role-specific redirect
const messagingChannelRedirect = (variant) => `import { redirect } from "next/navigation";

export default function ChannelPage() {
  redirect("/${variant}/messaging");
}
`;

let created = 0;

for (const [group, pages] of Object.entries(routeGroups)) {
  const variant = group.replace(/[()]/g, ""); // "admin", "coach", etc.

  for (const page of pages) {
    const targetDir = path.join(APP_DIR, group, page);
    const targetFile = path.join(targetDir, "page.tsx");

    // Create directory if needed
    fs.mkdirSync(targetDir, { recursive: true });

    // Skip if already has a page.tsx (layout files we created manually)
    if (fs.existsSync(targetFile)) {
      console.log(`- ${group}/${page}/page.tsx (already exists)`);
      continue;
    }

    // Generate re-export
    const content = `export { default } from "@/app/_shared-pages/${page}/page";\n`;
    fs.writeFileSync(targetFile, content);
    created++;
    console.log(`✓ ${group}/${page}/page.tsx`);
  }

  // Add messaging/[channelId] with redirect
  const channelDir = path.join(APP_DIR, group, "messaging/[channelId]");
  const channelFile = path.join(channelDir, "page.tsx");
  if (pages.includes("messaging") && !fs.existsSync(channelFile)) {
    fs.mkdirSync(channelDir, { recursive: true });
    fs.writeFileSync(channelFile, messagingChannelRedirect(variant));
    created++;
    console.log(`✓ ${group}/messaging/[channelId]/page.tsx (redirect)`);
  }
}

console.log(`\nDone: ${created} page files created.`);
