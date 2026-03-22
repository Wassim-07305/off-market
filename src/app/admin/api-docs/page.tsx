import { BookOpen, Key, Shield, Clock } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.off-market.fr";

interface EndpointDoc {
  method: "GET" | "POST";
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  exampleResponse: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: "GET",
    path: "/api/v1/clients",
    description: "Liste des clients avec pagination et filtres.",
    params: [
      { name: "page", type: "number", required: false, description: "Numero de page (defaut: 1)" },
      { name: "limit", type: "number", required: false, description: "Resultats par page (defaut: 50, max: 100)" },
      { name: "search", type: "string", required: false, description: "Recherche par nom ou email" },
      { name: "tag", type: "string", required: false, description: "Filtrer par tag client" },
    ],
    exampleResponse: `{
  "data": [
    {
      "id": "uuid",
      "full_name": "Jean Dupont",
      "email": "jean@example.com",
      "phone": "+33612345678",
      "tag": "premium",
      "status": "active",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-03-10T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 42,
    "pages": 1
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/leads",
    description: "Liste des leads avec pagination et filtres.",
    params: [
      { name: "page", type: "number", required: false, description: "Numero de page (defaut: 1)" },
      { name: "limit", type: "number", required: false, description: "Resultats par page (defaut: 50, max: 100)" },
      { name: "status", type: "string", required: false, description: "Filtrer par statut (premier_message, qualifie, rdv_pris, etc.)" },
      { name: "search", type: "string", required: false, description: "Recherche par nom ou email" },
    ],
    exampleResponse: `{
  "data": [
    {
      "id": "uuid",
      "full_name": "Marie Martin",
      "email": "marie@example.com",
      "phone": "+33698765432",
      "source": "instagram",
      "status": "qualifie",
      "assigned_to": "uuid",
      "created_at": "2026-03-01T08:00:00Z",
      "updated_at": "2026-03-15T16:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 128,
    "pages": 3
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/calls",
    description: "Liste des appels planifies avec pagination et filtres.",
    params: [
      { name: "page", type: "number", required: false, description: "Numero de page (defaut: 1)" },
      { name: "limit", type: "number", required: false, description: "Resultats par page (defaut: 50, max: 100)" },
      { name: "status", type: "string", required: false, description: "Filtrer par statut" },
      { name: "from", type: "string", required: false, description: "Date de debut (YYYY-MM-DD)" },
      { name: "to", type: "string", required: false, description: "Date de fin (YYYY-MM-DD)" },
    ],
    exampleResponse: `{
  "data": [
    {
      "id": "uuid",
      "title": "Appel decouverte",
      "date": "2026-03-20",
      "time_start": "14:00",
      "time_end": "14:30",
      "call_type": "discovery",
      "status": "scheduled",
      "client_id": "uuid",
      "assigned_to": "uuid",
      "created_at": "2026-03-18T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "pages": 1
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/invoices",
    description: "Liste des factures (entrees financieres de type revenue) avec filtres.",
    params: [
      { name: "page", type: "number", required: false, description: "Numero de page (defaut: 1)" },
      { name: "limit", type: "number", required: false, description: "Resultats par page (defaut: 20, max: 100)" },
      { name: "status", type: "string", required: false, description: "Filtrer par statut (paid, pending, overdue)" },
      { name: "from", type: "string", required: false, description: "Date de debut (YYYY-MM-DD)" },
      { name: "to", type: "string", required: false, description: "Date de fin (YYYY-MM-DD)" },
    ],
    exampleResponse: `{
  "data": [
    {
      "id": "uuid",
      "label": "Coaching Premium - Mars 2026",
      "amount": 2500,
      "type": "revenue",
      "status": "paid",
      "date": "2026-03-01",
      "client_id": "uuid",
      "created_at": "2026-03-01T00:00:00Z",
      "updated_at": "2026-03-05T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 67,
    "pages": 4
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/contracts",
    description: "Liste des contrats avec filtres par statut et client.",
    params: [
      { name: "page", type: "number", required: false, description: "Numero de page (defaut: 1)" },
      { name: "limit", type: "number", required: false, description: "Resultats par page (defaut: 20, max: 100)" },
      { name: "status", type: "string", required: false, description: "Filtrer par statut (draft, sent, signed, expired)" },
      { name: "client_id", type: "string", required: false, description: "Filtrer par ID client" },
    ],
    exampleResponse: `{
  "data": [
    {
      "id": "uuid",
      "title": "Contrat Coaching 6 mois",
      "status": "signed",
      "client_id": "uuid",
      "amount": 15000,
      "start_date": "2026-01-01",
      "end_date": "2026-06-30",
      "signed_at": "2025-12-20T14:00:00Z",
      "created_at": "2025-12-15T10:00:00Z",
      "updated_at": "2025-12-20T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 23,
    "pages": 2
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/formations",
    description: "Liste des formations avec filtres.",
    params: [
      { name: "page", type: "number", required: false, description: "Numero de page (defaut: 1)" },
      { name: "limit", type: "number", required: false, description: "Resultats par page (defaut: 20, max: 100)" },
      { name: "status", type: "string", required: false, description: "Filtrer par statut (draft, published, archived)" },
      { name: "search", type: "string", required: false, description: "Recherche par titre" },
    ],
    exampleResponse: `{
  "data": [
    {
      "id": "uuid",
      "title": "Masterclass Closing",
      "description": "Formation complete sur les techniques de closing.",
      "status": "published",
      "thumbnail_url": "https://...",
      "modules_count": 8,
      "created_at": "2025-10-01T10:00:00Z",
      "updated_at": "2026-02-15T08:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}`,
  },
];

function MethodBadge({ method }: { method: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
      {method}
    </span>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 overflow-x-auto font-mono leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="size-8 rounded-xl bg-[#AF0000]/10 flex items-center justify-center">
          <Icon className="size-4 text-[#AF0000]" />
        </div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Documentation API
          </span>
        </h1>
        <p className="text-sm text-muted-foreground/70">
          Reference complete de l&apos;API REST Off-Market v1
        </p>
      </div>

      {/* Base URL */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Base URL</span>
        <code className="text-sm text-zinc-200 font-mono">{BASE_URL}</code>
      </div>

      {/* Authentication */}
      <SectionCard icon={Key} title="Authentification">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Toutes les requetes vers l&apos;API v1 doivent inclure une cle API dans le header
            <code className="mx-1 px-1.5 py-0.5 bg-muted rounded text-foreground text-xs font-mono">Authorization</code>.
          </p>
          <p>
            Les cles API suivent le format <code className="px-1.5 py-0.5 bg-muted rounded text-foreground text-xs font-mono">om_live_...</code> et
            sont generees depuis les reglages de votre compte admin.
          </p>
          <CodeBlock>{`curl -H "Authorization: Bearer om_live_votre_cle_api" \\
  ${BASE_URL}/api/v1/clients`}</CodeBlock>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-200 text-xs">
            <p className="font-semibold mb-1">Scopes disponibles</p>
            <ul className="list-disc list-inside space-y-1 text-amber-200/80">
              <li><code className="font-mono">read</code> — Lecture des donnees (GET)</li>
              <li><code className="font-mono">write</code> — Creation et modification (POST, PUT, PATCH)</li>
              <li><code className="font-mono">admin</code> — Acces complet (inclut read + write)</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Rate Limiting */}
      <SectionCard icon={Shield} title="Rate Limiting">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            L&apos;API utilise un systeme de rate limiting par adresse IP avec fenetre glissante.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">20</p>
              <p className="text-xs text-muted-foreground mt-1">requetes / minute</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 uppercase tracking-wider">API v1</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">60</p>
              <p className="text-xs text-muted-foreground mt-1">requetes / minute</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 uppercase tracking-wider">API generale</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">10</p>
              <p className="text-xs text-muted-foreground mt-1">requetes / minute</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 uppercase tracking-wider">Routes IA</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70">
            En cas de depassement, l&apos;API retourne un statut HTTP <code className="font-mono px-1 py-0.5 bg-muted rounded">429 Too Many Requests</code>.
          </p>
        </div>
      </SectionCard>

      {/* Pagination */}
      <SectionCard icon={Clock} title="Pagination">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Tous les endpoints de liste supportent la pagination via les query params
            <code className="mx-1 px-1.5 py-0.5 bg-muted rounded text-foreground text-xs font-mono">page</code> et
            <code className="mx-1 px-1.5 py-0.5 bg-muted rounded text-foreground text-xs font-mono">limit</code>.
          </p>
          <CodeBlock>{`GET /api/v1/clients?page=2&limit=20

// Reponse inclut un objet pagination :
{
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}`}</CodeBlock>
        </div>
      </SectionCard>

      {/* Endpoints */}
      <div className="space-y-1 mt-8">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="size-8 rounded-xl bg-[#AF0000]/10 flex items-center justify-center">
            <BookOpen className="size-4 text-[#AF0000]" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Endpoints</h2>
        </div>
      </div>

      {ENDPOINTS.map((ep) => (
        <div
          key={ep.path}
          className="bg-surface border border-border rounded-2xl overflow-hidden"
        >
          {/* Endpoint header */}
          <div className="px-6 py-4 border-b border-border flex items-center gap-3 flex-wrap">
            <MethodBadge method={ep.method} />
            <code className="text-sm font-mono text-foreground font-medium">{ep.path}</code>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">{ep.description}</p>

            {/* Parameters */}
            {ep.params && ep.params.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                  Parametres
                </h4>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 text-left">
                        <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Nom</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Requis</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ep.params.map((p) => (
                        <tr key={p.name} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-xs text-foreground">{p.name}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.type}</td>
                          <td className="px-4 py-2.5">
                            {p.required ? (
                              <span className="text-xs font-medium text-[#AF0000]">Oui</span>
                            ) : (
                              <span className="text-xs text-muted-foreground/60">Non</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Example response */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                Exemple de reponse
              </h4>
              <CodeBlock>{ep.exampleResponse}</CodeBlock>
            </div>
          </div>
        </div>
      ))}

      {/* Error codes */}
      <SectionCard icon={Shield} title="Codes d'erreur">
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Code</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 font-mono text-foreground">400</td>
                <td className="px-4 py-2.5 text-muted-foreground">Requete invalide (parametres manquants ou incorrects)</td>
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 font-mono text-foreground">401</td>
                <td className="px-4 py-2.5 text-muted-foreground">Cle API manquante, invalide ou expiree</td>
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 font-mono text-foreground">403</td>
                <td className="px-4 py-2.5 text-muted-foreground">Scope insuffisant pour cette operation</td>
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 font-mono text-foreground">429</td>
                <td className="px-4 py-2.5 text-muted-foreground">Rate limit depasse — reessayer apres la fenetre</td>
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 font-mono text-foreground">500</td>
                <td className="px-4 py-2.5 text-muted-foreground">Erreur interne du serveur</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
