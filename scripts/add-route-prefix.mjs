/**
 * Script to add useRoutePrefix() to all pages with internal links
 * and update their hardcoded route paths to use the prefix.
 */
import fs from "fs";
import path from "path";

const BASE = "/Users/wassim/Projets/Off-Market/src/app/(dashboard)";

const IMPORT_LINE = `import { useRoutePrefix } from "@/hooks/use-route-prefix";`;

// Files and their specific replacements
const files = [
  {
    // CRM page - already has import + needs prefix const
    // Actually already handled, skip import add
    path: "crm/page.tsx",
    skipImport: true, // already added
    skipConst: true, // already added
    replacements: []  // already handled
  },
  {
    path: "crm/[id]/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const { id } = use(params);`,
    skipConst: true, // already added
    replacements: [
      ['href="/crm"', 'href={`${prefix}/crm`}'],
      ['href="/messaging"', 'href={`${prefix}/messaging`}'],
    ],
  },
  {
    path: "school/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const { isStaff } = useAuth();`,
    replacements: [
      ['href="/school/builder"', 'href={`${prefix}/school/builder`}'],
      ['href={`/school/${course.id}`}', 'href={`${prefix}/school/${course.id}`}'],
    ],
  },
  {
    path: "school/[courseId]/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const { isStaff } = useAuth();`,
    replacements: [
      ['href="/school"', 'href={`${prefix}/school`}'],
      ['href={`/school/builder/${courseId}`}', 'href={`${prefix}/school/builder/${courseId}`}'],
      ['href={`/school/${courseId}/${lesson.id}`}', 'href={`${prefix}/school/${courseId}/${lesson.id}`}'],
    ],
  },
  {
    path: "school/[courseId]/[lessonId]/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const supabase = useSupabase();`,
    replacements: [
      ['href={`/school/${courseId}`}', 'href={`${prefix}/school/${courseId}`}'],
    ],
  },
  {
    path: "school/builder/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const { createCourse, createModule, createLesson } = useCourseMutations();`,
    replacements: [
      ['router.push("/school")', 'router.push(`${prefix}/school`)'],
      ['href="/school"', 'href={`${prefix}/school`}'],
    ],
  },
  {
    path: "school/builder/[courseId]/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const { data: course, isLoading } = useCourse(courseId);`,
    replacements: [
      ['href={`/school/${courseId}`}', 'href={`${prefix}/school/${courseId}`}'],
    ],
  },
  {
    path: "forms/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const { isStaff } = useAuth();`,
    replacements: [
      ['href="/forms/builder"', 'href={`${prefix}/forms/builder`}'],
      ['href={`/forms/${form.id}`}', 'href={`${prefix}/forms/${form.id}`}'],
    ],
  },
  {
    path: "forms/[formId]/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const { data: submissions, isLoading: subsLoading } = useFormSubmissions(formId);`,
    replacements: [
      ['href="/forms"', 'href={`${prefix}/forms`}'],
      ['href={`/forms/builder/${formId}`}', 'href={`${prefix}/forms/builder/${formId}`}'],
      ['href={`/forms/${formId}/respond`}', 'href={`${prefix}/forms/${formId}/respond`}'],
    ],
  },
  {
    path: "forms/[formId]/respond/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const [submitted, setSubmitted] = useState(false);`,
    replacements: [
      ['href="/forms"', 'href={`${prefix}/forms`}'],
      ['href={`/forms/${formId}`}', 'href={`${prefix}/forms/${formId}`}'],
    ],
  },
  {
    path: "forms/builder/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const { user } = useAuth();`,
    replacements: [
      ['router.push("/forms")', 'router.push(`${prefix}/forms`)'],
      ['href="/forms"', 'href={`${prefix}/forms`}'],
    ],
  },
  {
    path: "forms/builder/[formId]/page.tsx",
    addImportAfter: `import Link from "next/link";`,
    addConstAfter: `const { data: form, isLoading } = useForm(formId);`,
    replacements: [
      ['href={`/forms/${formId}`}', 'href={`${prefix}/forms/${formId}`}'],
    ],
  },
];

let modified = 0;

for (const file of files) {
  const filePath = path.join(BASE, file.path);
  let content = fs.readFileSync(filePath, "utf-8");
  let changed = false;

  // Add import if needed
  if (!file.skipImport && file.addImportAfter && !content.includes("useRoutePrefix")) {
    content = content.replace(file.addImportAfter, file.addImportAfter + "\n" + IMPORT_LINE);
    changed = true;
  }

  // Add const prefix if needed
  if (!file.skipConst && file.addConstAfter && !content.includes("const prefix = useRoutePrefix()")) {
    content = content.replace(file.addConstAfter, file.addConstAfter + "\n  const prefix = useRoutePrefix();");
    changed = true;
  }

  // Apply replacements
  for (const [from, to] of file.replacements) {
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf-8");
    modified++;
    console.log(`✓ ${file.path}`);
  } else {
    console.log(`- ${file.path} (no changes needed)`);
  }
}

console.log(`\nDone: ${modified} files modified.`);
