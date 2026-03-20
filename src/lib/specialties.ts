// Shared list of specialties — used in onboarding, invitations, and coach matching
export const SPECIALTIES = [
  { value: "dev-web", label: "Developpement web" },
  { value: "copywriting", label: "Copywriting" },
  { value: "marketing", label: "Marketing digital" },
  { value: "design", label: "Design / UI-UX" },
  { value: "coaching", label: "Coaching" },
  { value: "video", label: "Video / Montage" },
  { value: "ads", label: "Media buying / Ads" },
  { value: "seo", label: "SEO / Redaction" },
  { value: "community", label: "Community management" },
] as const;

export type SpecialtyValue = (typeof SPECIALTIES)[number]["value"];
