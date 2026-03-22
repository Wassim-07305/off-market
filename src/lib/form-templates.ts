// Templates de formulaires pre-construits pour Off-Market
// Utilises dans le form builder pour demarrer rapidement

export interface FormTemplateField {
  label: string;
  field_type: string;
  required: boolean;
  sort_order: number;
  options: string[] | null;
  placeholder: string | null;
  validation: Record<string, unknown> | null;
  conditional_logic: Record<string, unknown> | null;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "satisfaction"
    | "onboarding"
    | "evaluation"
    | "feedback"
    | "sondage";
  icon: string; // Lucide icon name
  fields: FormTemplateField[];
}

export const FORM_TEMPLATE_CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "satisfaction", label: "Satisfaction" },
  { value: "onboarding", label: "Onboarding" },
  { value: "evaluation", label: "Evaluation" },
  { value: "feedback", label: "Feedback" },
  { value: "sondage", label: "Sondage" },
] as const;

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "nps-survey",
    name: "Enquete NPS",
    description: "Mesurez la satisfaction client avec le Net Promoter Score",
    category: "satisfaction",
    icon: "BarChart2",
    fields: [
      {
        label:
          "Sur une echelle de 0 a 10, quelle est la probabilite que vous recommandiez Off-Market a un ami ou collegue ?",
        field_type: "nps",
        required: true,
        sort_order: 0,
        options: null,
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Qu'est-ce qui explique votre note ?",
        field_type: "textarea",
        required: false,
        sort_order: 1,
        options: null,
        placeholder: "Dites-nous en plus...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Que pourrions-nous ameliorer ?",
        field_type: "textarea",
        required: false,
        sort_order: 2,
        options: null,
        placeholder: "Vos suggestions...",
        validation: null,
        conditional_logic: null,
      },
    ],
  },
  {
    id: "csat-survey",
    name: "Satisfaction Client (CSAT)",
    description: "Evaluez la satisfaction globale apres une interaction",
    category: "satisfaction",
    icon: "Star",
    fields: [
      {
        label: "Comment evaluez-vous votre experience globale ?",
        field_type: "rating",
        required: true,
        sort_order: 0,
        options: null,
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Quel aspect avez-vous le plus apprecie ?",
        field_type: "select",
        required: false,
        sort_order: 1,
        options: [
          "La formation",
          "Le coaching",
          "La communaute",
          "Le support",
          "Les outils",
          "Autre",
        ],
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Commentaires supplementaires",
        field_type: "textarea",
        required: false,
        sort_order: 2,
        options: null,
        placeholder: "Partagez vos impressions...",
        validation: null,
        conditional_logic: null,
      },
    ],
  },
  {
    id: "onboarding-intake",
    name: "Formulaire d'accueil",
    description: "Collectez les informations essentielles des nouveaux eleves",
    category: "onboarding",
    icon: "UserPlus",
    fields: [
      {
        label: "Quel est votre domaine d'activite ?",
        field_type: "text",
        required: true,
        sort_order: 0,
        options: null,
        placeholder: "Ex: Coach sportif, consultant marketing...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Depuis combien de temps exercez-vous ?",
        field_type: "select",
        required: true,
        sort_order: 1,
        options: ["Moins d'un an", "1-3 ans", "3-5 ans", "Plus de 5 ans"],
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Quel est votre chiffre d'affaires mensuel actuel ?",
        field_type: "select",
        required: true,
        sort_order: 2,
        options: [
          "Moins de 1 000 EUR",
          "1 000 - 3 000 EUR",
          "3 000 - 5 000 EUR",
          "5 000 - 10 000 EUR",
          "Plus de 10 000 EUR",
        ],
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Pourquoi avez-vous rejoint le programme ?",
        field_type: "textarea",
        required: true,
        sort_order: 3,
        options: null,
        placeholder: "Qu'est-ce qui vous a motive a rejoindre ?",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Quel est votre objectif a 90 jours ?",
        field_type: "textarea",
        required: true,
        sort_order: 4,
        options: null,
        placeholder: "Ex: Atteindre 5 000 EUR/mois, signer 3 clients...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Comment preferez-vous apprendre ?",
        field_type: "checkbox",
        required: false,
        sort_order: 5,
        options: [
          "Videos",
          "Textes/articles",
          "Appels 1-to-1",
          "Groupe/communaute",
          "Exercices pratiques",
        ],
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
    ],
  },
  {
    id: "session-feedback",
    name: "Feedback post-session",
    description: "Recueillez un retour apres chaque session de coaching",
    category: "feedback",
    icon: "MessageSquare",
    fields: [
      {
        label: "Comment evaluez-vous cette session ?",
        field_type: "rating",
        required: true,
        sort_order: 0,
        options: null,
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Qu'avez-vous appris aujourd'hui ?",
        field_type: "textarea",
        required: true,
        sort_order: 1,
        options: null,
        placeholder: "Les points cles de cette session...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Quelle action allez-vous mettre en place cette semaine ?",
        field_type: "textarea",
        required: true,
        sort_order: 2,
        options: null,
        placeholder: "Votre prochaine action concrete...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Y a-t-il un point que vous aimeriez approfondir ?",
        field_type: "textarea",
        required: false,
        sort_order: 3,
        options: null,
        placeholder: "Un sujet a reprendre la prochaine fois...",
        validation: null,
        conditional_logic: null,
      },
    ],
  },
  {
    id: "formation-eval",
    name: "Evaluation de formation",
    description: "Evaluez la qualite d'un module ou cours de formation",
    category: "evaluation",
    icon: "GraduationCap",
    fields: [
      {
        label: "Quel module venez-vous de terminer ?",
        field_type: "text",
        required: true,
        sort_order: 0,
        options: null,
        placeholder: "Nom du module...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Le contenu etait-il clair et comprehensible ?",
        field_type: "rating",
        required: true,
        sort_order: 1,
        options: null,
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Le contenu est-il applicable a votre situation ?",
        field_type: "rating",
        required: true,
        sort_order: 2,
        options: null,
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Qu'avez-vous le plus apprecie ?",
        field_type: "textarea",
        required: false,
        sort_order: 3,
        options: null,
        placeholder: "Ce qui vous a marque...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Que changeriez-vous dans ce module ?",
        field_type: "textarea",
        required: false,
        sort_order: 4,
        options: null,
        placeholder: "Vos suggestions d'amelioration...",
        validation: null,
        conditional_logic: null,
      },
    ],
  },
  {
    id: "pre-call-questions",
    name: "Questions pre-appel",
    description: "Questions standardisees avant chaque appel de coaching",
    category: "feedback",
    icon: "Phone",
    fields: [
      {
        label:
          "Quel est l'objectif de cet appel ? Quel probleme voulez-vous resoudre ?",
        field_type: "textarea",
        required: true,
        sort_order: 0,
        options: null,
        placeholder: "Decrivez votre problematique principale...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Quelle solution avez-vous deja essayee ?",
        field_type: "textarea",
        required: true,
        sort_order: 1,
        options: null,
        placeholder: "Ce que vous avez tente jusqu'ici...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Sur une echelle de 1 a 5, a quel point est-ce urgent ?",
        field_type: "rating",
        required: true,
        sort_order: 2,
        options: null,
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
    ],
  },
  {
    id: "engagement-survey",
    name: "Sondage d'engagement",
    description: "Mesurez l'engagement et la motivation des eleves",
    category: "sondage",
    icon: "Gauge",
    fields: [
      {
        label: "Comment vous sentez-vous dans le programme actuellement ?",
        field_type: "select",
        required: true,
        sort_order: 0,
        options: [
          "Tres motive(e)",
          "Motive(e)",
          "Neutre",
          "Demotive(e)",
          "Tres demotive(e)",
        ],
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Combien de temps consacrez-vous au programme par semaine ?",
        field_type: "select",
        required: true,
        sort_order: 1,
        options: ["Moins d'1h", "1-3h", "3-5h", "5-10h", "Plus de 10h"],
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Quel est votre principal obstacle actuellement ?",
        field_type: "select",
        required: true,
        sort_order: 2,
        options: [
          "Manque de temps",
          "Manque de clarte",
          "Problemes techniques",
          "Manque de motivation",
          "Pas d'obstacle",
          "Autre",
        ],
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Qu'est-ce qui vous aiderait le plus en ce moment ?",
        field_type: "textarea",
        required: false,
        sort_order: 3,
        options: null,
        placeholder: "Dites-nous comment on peut vous aider...",
        validation: null,
        conditional_logic: null,
      },
    ],
  },
  {
    id: "exit-interview",
    name: "Entretien de sortie",
    description: "Comprenez pourquoi un eleve quitte le programme",
    category: "feedback",
    icon: "LogOut",
    fields: [
      {
        label: "Quelle est la raison principale de votre depart ?",
        field_type: "select",
        required: true,
        sort_order: 0,
        options: [
          "Objectifs atteints",
          "Manque de resultats",
          "Probleme financier",
          "Manque de temps",
          "Insatisfaction du coaching",
          "Changement de projet",
          "Autre",
        ],
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Comment evalueriez-vous votre experience globale ?",
        field_type: "nps",
        required: true,
        sort_order: 1,
        options: null,
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Qu'aurions-nous pu faire differemment ?",
        field_type: "textarea",
        required: false,
        sort_order: 2,
        options: null,
        placeholder: "Vos suggestions...",
        validation: null,
        conditional_logic: null,
      },
      {
        label: "Recommanderiez-vous le programme a d'autres ?",
        field_type: "select",
        required: true,
        sort_order: 3,
        options: ["Oui, sans hesiter", "Oui, avec des reserves", "Non"],
        placeholder: null,
        validation: null,
        conditional_logic: null,
      },
    ],
  },
];

export function getTemplatesByCategory(category: string): FormTemplate[] {
  if (category === "all") return FORM_TEMPLATES;
  return FORM_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): FormTemplate | undefined {
  return FORM_TEMPLATES.find((t) => t.id === id);
}
