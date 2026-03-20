"use client";

import { useState } from "react";
import { Loader2, X, Mail, Copy, Check } from "lucide-react";
import { useInvitations } from "@/hooks/use-invitations";
import { ROLE_OPTIONS } from "@/types/invitations";
import type { UserInvite } from "@/types/invitations";
import { SPECIALTIES } from "@/lib/specialties";
import { cn } from "@/lib/utils";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteUserModal({ open, onClose }: InviteUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [createdInvite, setCreatedInvite] = useState<UserInvite | null>(null);
  const [copied, setCopied] = useState(false);
  const { createInvitation } = useInvitations();

  const showSpecialties = role === "coach";

  const toggleSpecialty = (value: string) => {
    setSpecialties((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  };

  if (!open) return null;

  const inviteLink = createdInvite
    ? `${window.location.origin}/register?code=${createdInvite.invite_code}`
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    if (showSpecialties && specialties.length === 0) return;

    createInvitation.mutate(
      {
        email: email.trim(),
        full_name: fullName.trim(),
        role,
        specialties: showSpecialties ? specialties : undefined,
      },
      {
        onSuccess: (data) => {
          setCreatedInvite(data);
        },
      },
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setFullName("");
    setEmail("");
    setRole("client");
    setSpecialties([]);
    setCreatedInvite(null);
    setCopied(false);
    onClose();
  };

  const inputClass =
    "w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {createdInvite ? "Invitation creee" : "Nouvelle invitation"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {createdInvite
                  ? "Partagez le lien avec la personne"
                  : "Inviter un utilisateur sur la plateforme"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {createdInvite ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                Invitation creee !
              </p>
              <p className="text-xs text-muted-foreground">
                {createdInvite.full_name} ({createdInvite.email}) —{" "}
                {
                  ROLE_OPTIONS.find((r) => r.value === createdInvite.role)
                    ?.label
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Lien d&apos;invitation
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className={`${inputClass} flex-1 text-xs`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className="h-10 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2 shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copie !" : "Copier"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ce lien expire dans 7 jours.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full h-10 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nom complet *
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@email.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClass}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {showSpecialties && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Specialites * <span className="text-xs text-muted-foreground font-normal">(min. 1)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SPECIALTIES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggleSpecialty(s.value)}
                      className={cn(
                        "h-9 px-3 rounded-lg text-xs font-medium transition-all border",
                        specialties.includes(s.value)
                          ? "bg-primary/15 border-primary/30 text-primary"
                          : "bg-muted/50 border-border text-muted-foreground hover:border-primary/20 hover:text-foreground",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {specialties.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1.5">
                    Selectionne au moins une specialite
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 h-10 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createInvitation.isPending}
                className="flex-1 h-10 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createInvitation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {createInvitation.isPending
                  ? "Creation..."
                  : "Creer l'invitation"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
