"use client";

import { useState, useEffect } from "react";
import { X, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useCreateUpsell } from "@/hooks/use-upsell";
import { useSupabase } from "@/hooks/use-supabase";
import { cn } from "@/lib/utils";

interface UpsellFormModalProps {
  open: boolean;
  onClose: () => void;
}

interface StudentOption {
  id: string;
  profile_id: string;
  profile: {
    full_name: string;
  } | null;
}

const OFFER_TYPE_OPTIONS = [
  { value: "avancee", label: "Offre avancee" },
  { value: "mastermind", label: "Mastermind" },
  { value: "vip", label: "Accompagnement VIP" },
] as const;

const TRIGGER_TYPE_OPTIONS = [
  { value: "revenue_milestone", label: "Palier de revenus" },
  { value: "completion", label: "Fin de programme" },
  { value: "manual", label: "Manuel" },
] as const;

export function UpsellFormModal({ open, onClose }: UpsellFormModalProps) {
  const createUpsell = useCreateUpsell();
  const supabase = useSupabase();

  const [studentId, setStudentId] = useState("");
  const [offerType, setOfferType] = useState<string>("avancee");
  const [offerName, setOfferName] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [triggerValue, setTriggerValue] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [saving, setSaving] = useState(false);

  // Erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    // Charger la liste des eleves
    supabase
      .from("student_details")
      .select(
        "id, profile_id, profile:profiles!student_details_profile_id_fkey(full_name)",
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setStudents((data as unknown as StudentOption[]) ?? []);
      });

    // Reset form
    setStudentId("");
    setOfferType("avancee");
    setOfferName("");
    setTriggerType("manual");
    setTriggerValue("");
    setAmount("");
    setMessage("");
    setNotes("");
    setErrors({});
  }, [open, supabase]);

  // Auto-fill offer name based on type
  useEffect(() => {
    if (!offerName || OFFER_TYPE_OPTIONS.some((o) => o.label === offerName)) {
      const selected = OFFER_TYPE_OPTIONS.find((o) => o.value === offerType);
      if (selected) setOfferName(selected.label);
    }
  }, [offerType, offerName]);

  if (!open) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!studentId) newErrors.studentId = "Sélectionnez un élève";
    if (!offerName.trim()) newErrors.offerName = "Le nom de l'offre est requis";
    if (!amount || Number(amount) <= 0)
      newErrors.amount = "Le montant doit etre superieur a 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    try {
      await createUpsell.mutateAsync({
        student_id: studentId,
        trigger_type: triggerType,
        trigger_value: triggerValue || undefined,
        offer_name: offerName,
        offer_type: offerType as "avancee" | "mastermind" | "vip",
        amount: Number(amount),
        message: message || undefined,
        notes: notes || undefined,
      });
      toast.success("Opportunite d'upsell creee");
      onClose();
    } catch {
      toast.error("Erreur lors de la creation");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const selectClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const labelClass =
    "block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5";
  const errorClass = "text-[10px] text-destructive mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface rounded-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 sticky top-0 bg-surface rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-display font-semibold text-foreground">
              Nouvelle opportunite d&apos;upsell
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Eleve */}
          <div>
            <label className={labelClass}>Eleve *</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={cn(
                selectClass,
                errors.studentId && "ring-2 ring-destructive/30",
              )}
            >
              <option value="">Sélectionner un élève...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.profile?.full_name ?? s.profile_id}
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className={errorClass}>{errors.studentId}</p>
            )}
          </div>

          {/* Type d'offre */}
          <div>
            <label className={labelClass}>Type d&apos;offre *</label>
            <select
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
              className={selectClass}
            >
              {OFFER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nom de l'offre */}
          <div>
            <label className={labelClass}>Nom de l&apos;offre *</label>
            <input
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              placeholder="Ex: Programme Mastermind 6 mois"
              className={cn(
                inputClass,
                errors.offerName && "ring-2 ring-destructive/30",
              )}
            />
            {errors.offerName && (
              <p className={errorClass}>{errors.offerName}</p>
            )}
          </div>

          {/* Montant + Declencheur */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Montant (EUR) *</label>
              <input
                type="number"
                min="0"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                className={cn(
                  inputClass,
                  errors.amount && "ring-2 ring-destructive/30",
                )}
              />
              {errors.amount && <p className={errorClass}>{errors.amount}</p>}
            </div>
            <div>
              <label className={labelClass}>Declencheur</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className={selectClass}
              >
                {TRIGGER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Valeur declencheur (conditionnel) */}
          {triggerType === "revenue_milestone" && (
            <div>
              <label className={labelClass}>Palier de revenus atteint</label>
              <input
                value={triggerValue}
                onChange={(e) => setTriggerValue(e.target.value)}
                placeholder="Ex: 7000"
                className={inputClass}
              />
            </div>
          )}

          {/* Message personnalise */}
          <div>
            <label className={labelClass}>Message personnalise</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Message a envoyer a l'élève lors de la proposition..."
              className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            />
          </div>

          {/* Notes internes */}
          <div>
            <label className={labelClass}>Notes internes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notes visibles uniquement par l'équipe..."
              className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Creer l&apos;opportunite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
