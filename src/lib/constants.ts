export const STUDENT_TAGS = [
  {
    value: "vip",
    label: "VIP",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    value: "standard",
    label: "Standard",
    color: "bg-zinc-100 text-zinc-800 border-zinc-200",
  },
  {
    value: "new",
    label: "Nouveau",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    value: "at_risk",
    label: "A risque",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "churned",
    label: "Perdu",
    color: "bg-zinc-200 text-zinc-500 border-zinc-300",
  },
] as const;

export const ACTIVITY_TYPES = [
  { value: "module_started", label: "Module commenc\u00e9", icon: "BookOpen" },
  {
    value: "module_completed",
    label: "Module termin\u00e9",
    icon: "CheckCircle",
  },
  {
    value: "lesson_completed",
    label: "Le\u00e7on termin\u00e9e",
    icon: "Check",
  },
  { value: "form_submitted", label: "Formulaire soumis", icon: "FileText" },
  {
    value: "message_sent",
    label: "Message envoy\u00e9",
    icon: "MessageSquare",
  },
  { value: "login", label: "Connexion", icon: "LogIn" },
  { value: "milestone_reached", label: "Jalon atteint", icon: "Flag" },
  { value: "note_added", label: "Note ajout\u00e9e", icon: "StickyNote" },
  { value: "call_scheduled", label: "Appel planifi\u00e9", icon: "Phone" },
  {
    value: "payment_received",
    label: "Paiement re\u00e7u",
    icon: "CreditCard",
  },
] as const;

export const NOTIFICATION_TYPES = [
  { value: "new_message", label: "Nouveau message" },
  { value: "mention", label: "Mention" },
  { value: "form_response", label: "R\u00e9ponse formulaire" },
  { value: "module_complete", label: "Module termin\u00e9" },
  { value: "task_assigned", label: "T\u00e2che assign\u00e9e" },
  { value: "task_due", label: "T\u00e2che \u00e9ch\u00e9ante" },
  { value: "student_inactive", label: "El\u00e8ve inactif" },
  { value: "new_enrollment", label: "Nouvelle inscription" },
  { value: "ai_insight", label: "Insight IA" },
  { value: "system", label: "Syst\u00e8me" },
] as const;

export const FORM_FIELD_TYPES = [
  { value: "short_text", label: "Texte court", icon: "Type" },
  { value: "long_text", label: "Texte long", icon: "AlignLeft" },
  { value: "email", label: "Email", icon: "Mail" },
  { value: "phone", label: "T\u00e9l\u00e9phone", icon: "Phone" },
  { value: "number", label: "Nombre", icon: "Hash" },
  { value: "single_select", label: "Choix unique", icon: "CircleDot" },
  { value: "multi_select", label: "Choix multiples", icon: "CheckSquare" },
  { value: "dropdown", label: "Dropdown", icon: "ChevronDown" },
  { value: "rating", label: "Notation", icon: "Star" },
  { value: "nps", label: "NPS", icon: "BarChart" },
  { value: "scale", label: "Echelle", icon: "Sliders" },
  { value: "date", label: "Date", icon: "Calendar" },
  { value: "time", label: "Heure", icon: "Clock" },
  { value: "file_upload", label: "Upload fichier", icon: "Upload" },
  { value: "heading", label: "Titre", icon: "Heading" },
  { value: "paragraph", label: "Paragraphe", icon: "Text" },
  { value: "divider", label: "S\u00e9parateur", icon: "Minus" },
] as const;

export const LESSON_TYPES = [
  { value: "video", label: "Vid\u00e9o", icon: "Play" },
  { value: "text", label: "Texte", icon: "FileText" },
  { value: "pdf", label: "PDF", icon: "File" },
  { value: "quiz", label: "Quiz", icon: "HelpCircle" },
  { value: "assignment", label: "Exercice", icon: "PenTool" },
] as const;

export const ROLES = {
  admin: { label: "Admin", color: "bg-primary/10 text-primary" },
  coach: { label: "Coach", color: "bg-primary/10 text-primary" },
  setter: { label: "Setter", color: "bg-blue-100 text-blue-800" },
  closer: { label: "Closer", color: "bg-indigo-100 text-indigo-800" },
  client: { label: "Client", color: "bg-zinc-100 text-zinc-800" },
} as const;

export const STUDENT_FLAGS = [
  {
    value: "green" as const,
    label: "En bonne voie",
    description: "Progresse normalement",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  {
    value: "yellow" as const,
    label: "Attention",
    description: "Ralentissement detecte",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  {
    value: "orange" as const,
    label: "A risque",
    description: "Intervention necessaire",
    dotColor: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  {
    value: "red" as const,
    label: "Critique",
    description: "Action immediate requise",
    dotColor: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
];

export const STUDENT_PIPELINE_STAGES = [
  {
    value: "onboarding" as const,
    label: "Onboarding",
    color: "text-sky-800",
    bg: "bg-sky-100 border-sky-200",
    dotColor: "bg-sky-500",
  },
  {
    value: "learning" as const,
    label: "Apprentissage",
    color: "text-blue-800",
    bg: "bg-blue-100 border-blue-200",
    dotColor: "bg-blue-500",
  },
  {
    value: "practicing" as const,
    label: "Pratique",
    color: "text-violet-800",
    bg: "bg-violet-100 border-violet-200",
    dotColor: "bg-violet-500",
  },
  {
    value: "launching" as const,
    label: "Lancement",
    color: "text-amber-800",
    bg: "bg-amber-100 border-amber-200",
    dotColor: "bg-amber-500",
  },
  {
    value: "scaling" as const,
    label: "Scaling",
    color: "text-emerald-800",
    bg: "bg-emerald-100 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  {
    value: "autonomous" as const,
    label: "Autonome",
    color: "text-green-800",
    bg: "bg-green-100 border-green-200",
    dotColor: "bg-green-500",
  },
];

export type StudentTag = (typeof STUDENT_TAGS)[number]["value"];
export type ActivityType = (typeof ACTIVITY_TYPES)[number]["value"];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]["value"];
export type FormFieldType = (typeof FORM_FIELD_TYPES)[number]["value"];
export type LessonType = (typeof LESSON_TYPES)[number]["value"];
export type Role = keyof typeof ROLES;
