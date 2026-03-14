"use client";

import { useState } from "react";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/hooks/use-api-keys";
import {
  useWebhooks,
  useCreateWebhook,
  useDeleteWebhook,
  useToggleWebhook,
} from "@/hooks/use-webhooks";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Webhook,
  Globe,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatRelativeDate } from "@/lib/utils";

const WEBHOOK_EVENTS = [
  { value: "client.created", label: "Client cree" },
  { value: "client.updated", label: "Client mis a jour" },
  { value: "lead.created", label: "Lead cree" },
  { value: "lead.updated", label: "Lead mis a jour" },
  { value: "lead.status_changed", label: "Lead statut change" },
  { value: "call.scheduled", label: "Appel planifie" },
  { value: "call.completed", label: "Appel termine" },
  { value: "invoice.created", label: "Facture creee" },
  { value: "invoice.paid", label: "Facture payee" },
  { value: "form.submitted", label: "Formulaire soumis" },
];

export function ApiSettings() {
  const { data: keys, isLoading: keysLoading } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const { data: webhooks, isLoading: webhooksLoading } = useWebhooks();
  const createWebhook = useCreateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const toggleWebhook = useToggleWebhook();

  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(["read"]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [webhookName, setWebhookName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  const handleCreateKey = async () => {
    if (!newKeyName) return;
    const result = await createKey.mutateAsync({ name: newKeyName, scopes: newKeyScopes });
    setGeneratedKey(result.key);
    setNewKeyName("");
    toast.success("Cle API creee");
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCreateWebhook = async () => {
    if (!webhookName || !webhookUrl || !webhookEvents.length) return;
    const result = await createWebhook.mutateAsync({
      name: webhookName,
      url: webhookUrl,
      events: webhookEvents,
    });
    setGeneratedSecret(result.secret);
    setWebhookName("");
    setWebhookUrl("");
    setWebhookEvents([]);
    toast.success("Webhook cree");
  };

  const toggleScope = (scope: string) => {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const toggleEvent = (event: string) => {
    setWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  return (
    <div className="space-y-6">
      {/* API Keys Section */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Cles API</h2>
          </div>
          <button
            onClick={() => {
              setShowNewKey(!showNewKey);
              setGeneratedKey(null);
            }}
            className="h-8 px-3 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvelle cle
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Les cles API permettent l&apos;acces aux endpoints REST /api/v1/*.
          Format: <code className="bg-muted px-1 rounded">Authorization: Bearer om_live_...</code>
        </p>

        {/* New key form */}
        {showNewKey && (
          <div className="border border-border rounded-xl p-4 space-y-3">
            {generatedKey ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-warning flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Copie cette cle maintenant — elle ne sera plus affichee
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded-lg text-xs font-mono text-foreground break-all">
                    {generatedKey}
                  </code>
                  <button
                    onClick={handleCopyKey}
                    className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    {copiedKey ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowNewKey(false);
                    setGeneratedKey(null);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Nom de la cle (ex: Integration Zapier)"
                  className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-2">
                  {["read", "write", "admin"].map((scope) => (
                    <button
                      key={scope}
                      onClick={() => toggleScope(scope)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                        newKeyScopes.includes(scope)
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border text-muted-foreground hover:border-border/80",
                      )}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName || createKey.isPending}
                  className="h-8 px-4 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {createKey.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Generer la cle
                </button>
              </>
            )}
          </div>
        )}

        {/* Existing keys */}
        {keysLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : keys?.length ? (
          <div className="space-y-2">
            {keys.map((key) => (
              <div
                key={key.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border",
                  key.is_active ? "border-border" : "border-border/50 opacity-50",
                )}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{key.name}</span>
                    <code className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {key.key_prefix}...
                    </code>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{key.scopes.join(", ")}</span>
                    {key.last_used_at && (
                      <span>Utilise {formatRelativeDate(key.last_used_at)}</span>
                    )}
                    {key.revoked_at && <span className="text-error">Revoquee</span>}
                  </div>
                </div>
                {key.is_active && (
                  <button
                    onClick={() => {
                      if (confirm("Revoquer cette cle API ?")) {
                        revokeKey.mutate(key.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                    title="Revoquer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Aucune cle API creee
          </p>
        )}
      </div>

      {/* Webhooks Section */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Webhooks</h2>
          </div>
          <button
            onClick={() => {
              setShowNewWebhook(!showNewWebhook);
              setGeneratedSecret(null);
            }}
            className="h-8 px-3 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau webhook
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Recois des notifications HTTP POST en temps reel quand des evenements se produisent.
          Signatures HMAC-SHA256 via header <code className="bg-muted px-1 rounded">X-Webhook-Signature</code>.
        </p>

        {/* New webhook form */}
        {showNewWebhook && (
          <div className="border border-border rounded-xl p-4 space-y-3">
            {generatedSecret ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-warning flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Secret de signature — a conserver pour verifier les webhooks
                </p>
                <code className="block bg-muted px-3 py-2 rounded-lg text-xs font-mono text-foreground break-all">
                  {generatedSecret}
                </code>
                <button
                  onClick={() => {
                    setShowNewWebhook(false);
                    setGeneratedSecret(null);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  placeholder="Nom (ex: CRM Sync)"
                  className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Evenements</p>
                  <div className="flex flex-wrap gap-1.5">
                    {WEBHOOK_EVENTS.map((evt) => (
                      <button
                        key={evt.value}
                        onClick={() => toggleEvent(evt.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors",
                          webhookEvents.includes(evt.value)
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border text-muted-foreground hover:border-border/80",
                        )}
                      >
                        {evt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleCreateWebhook}
                  disabled={!webhookName || !webhookUrl || !webhookEvents.length || createWebhook.isPending}
                  className="h-8 px-4 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {createWebhook.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Creer le webhook
                </button>
              </>
            )}
          </div>
        )}

        {/* Existing webhooks */}
        {webhooksLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : webhooks?.length ? (
          <div className="space-y-2">
            {webhooks.map((wh) => (
              <div key={wh.id} className="border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{wh.name}</span>
                    {wh.is_active ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">
                        Actif
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        Inactif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleWebhook.mutate({ id: wh.id, is_active: !wh.is_active })}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={wh.is_active ? "Desactiver" : "Activer"}
                    >
                      {wh.is_active ? (
                        <ToggleRight className="w-4 h-4 text-success" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Supprimer ce webhook ?")) {
                          deleteWebhook.mutate(wh.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <code className="block text-[11px] font-mono text-muted-foreground truncate">
                  {wh.url}
                </code>
                <div className="flex flex-wrap gap-1">
                  {wh.events.map((evt) => (
                    <span
                      key={evt}
                      className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium text-muted-foreground"
                    >
                      {evt}
                    </span>
                  ))}
                </div>
                {/* Recent logs */}
                {wh.webhook_logs && wh.webhook_logs.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">Derniers envois:</span>
                    {wh.webhook_logs.slice(0, 5).map((log) => (
                      <span key={log.id} title={`${log.event} — ${log.response_status}`}>
                        {log.success ? (
                          <CheckCircle2 className="w-3 h-3 text-success" />
                        ) : (
                          <XCircle className="w-3 h-3 text-error" />
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Aucun webhook configure
          </p>
        )}
      </div>
    </div>
  );
}
