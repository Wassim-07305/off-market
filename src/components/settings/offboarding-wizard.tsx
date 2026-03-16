"use client";

import { useState, useMemo } from "react";
import {
  UserMinus,
  X,
  AlertTriangle,
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  Users,
  ArrowRight,
  MessageSquare,
  Download,
  Archive,
  FolderInput,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useCoaches } from "@/hooks/use-user-management";
import {
  useCreateOffboarding,
  useProcessOffboarding,
} from "@/hooks/use-offboarding";
import type { Profile, OffboardingDataActions } from "@/types/database";

interface OffboardingWizardProps {
  open: boolean;
  onClose: () => void;
  users: (Profile & { is_archived?: boolean })[];
}

const STEPS = [
  { title: "Utilisateur", description: "Selectionner et motif" },
  { title: "Transfert", description: "Choisir le destinataire" },
  { title: "Donnees", description: "Actions sur les donnees" },
  { title: "Confirmation", description: "Verifier et confirmer" },
];

export function OffboardingWizard({
  open,
  onClose,
  users,
}: OffboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [reason, setReason] = useState("");
  const [transferToId, setTransferToId] = useState("");
  const [dataActions, setDataActions] = useState<OffboardingDataActions>({
    transfer_clients: true,
    transfer_channels: true,
    archive_messages: false,
    export_data: true,
  });
  const [processing, setProcessing] = useState(false);

  const { data: coaches } = useCoaches();
  const createOffboarding = useCreateOffboarding();
  const processOffboarding = useProcessOffboarding();

  const activeUsers = useMemo(
    () => users.filter((u) => !u.is_archived),
    [users],
  );

  const selectedUser = activeUsers.find((u) => u.id === selectedUserId);
  const transferTarget = (coaches ?? []).find((c) => c.id === transferToId);

  // Users available as transfer targets (exclude selected user)
  const transferCandidates = useMemo(
    () => (coaches ?? []).filter((c) => c.id !== selectedUserId),
    [coaches, selectedUserId],
  );

  if (!open) return null;

  const handleReset = () => {
    setStep(0);
    setSelectedUserId("");
    setReason("");
    setTransferToId("");
    setDataActions({
      transfer_clients: true,
      transfer_channels: true,
      archive_messages: false,
      export_data: true,
    });
    setProcessing(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canNext = (): boolean => {
    switch (step) {
      case 0:
        return !!selectedUserId && reason.trim().length > 0;
      case 1:
        return true; // transfer is optional
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleConfirm = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      // Step 1: Create the offboarding request
      const request = await createOffboarding.mutateAsync({
        userId: selectedUserId,
        transferToId: transferToId || undefined,
        reason,
        dataActions,
      });

      // Step 2: Process it immediately
      await processOffboarding.mutateAsync(request.id);

      handleClose();
    } catch {
      setProcessing(false);
    }
  };

  const DATA_ACTION_OPTIONS = [
    {
      key: "transfer_clients" as const,
      label: "Transferer les clients",
      description: "Reassigner tous les clients et eleves au destinataire",
      icon: Users,
      disabled: !transferToId,
    },
    {
      key: "transfer_channels" as const,
      label: "Transferer les canaux",
      description: "Transferer la propriete des canaux de messagerie",
      icon: FolderInput,
      disabled: !transferToId,
    },
    {
      key: "archive_messages" as const,
      label: "Archiver les messages",
      description: "Masquer les messages envoyes par cet utilisateur",
      icon: Archive,
      warning: true,
    },
    {
      key: "export_data" as const,
      label: "Exporter les donnees",
      description: "Generer un export RGPD des donnees de l'utilisateur",
      icon: Download,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Offboarding utilisateur
              </h3>
              <p className="text-xs text-muted-foreground">
                {STEPS[step].title} — {STEPS[step].description}
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

        {/* Step indicators */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div
                  className={cn(
                    "w-full h-1 rounded-full transition-colors",
                    i <= step ? "bg-primary" : "bg-muted",
                  )}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {STEPS.map((s, i) => (
              <span
                key={i}
                className={cn(
                  "text-[10px]",
                  i <= step
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4 overflow-y-auto flex-1">
          {/* Step 0: Select user */}
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Utilisateur a desactiver *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Selectionner un utilisateur</option>
                  {activeUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} — {u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary font-semibold">
                      {getInitials(selectedUser.full_name)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedUser.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.email} — {selectedUser.role}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Motif de depart *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Ex: Fin de contrat, depart volontaire..."
                  className="w-full px-4 py-3 bg-muted/50 border-0 rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </>
          )}

          {/* Step 1: Transfer target */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Transferer les donnees a
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Selectionne un utilisateur qui reprendra les clients et
                  canaux. Optionnel si aucune donnee a transferer.
                </p>
                <select
                  value={transferToId}
                  onChange={(e) => setTransferToId(e.target.value)}
                  className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Aucun transfert</option>
                  {transferCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} — {c.email}
                    </option>
                  ))}
                </select>
              </div>

              {transferToId && selectedUser && transferTarget && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <div className="flex items-center gap-2 flex-1">
                    {selectedUser.avatar_url ? (
                      <img
                        src={selectedUser.avatar_url}
                        alt={selectedUser.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-xs text-red-500 font-semibold">
                        {getInitials(selectedUser.full_name)}
                      </div>
                    )}
                    <span className="text-sm text-foreground truncate">
                      {selectedUser.full_name}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2 flex-1">
                    {transferTarget.avatar_url ? (
                      <img
                        src={transferTarget.avatar_url}
                        alt={transferTarget.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs text-emerald-500 font-semibold">
                        {getInitials(transferTarget.full_name)}
                      </div>
                    )}
                    <span className="text-sm text-foreground truncate">
                      {transferTarget.full_name}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 2: Data actions */}
          {step === 2 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Selectionne les actions a effectuer sur les donnees de{" "}
                <span className="font-medium text-foreground">
                  {selectedUser?.full_name}
                </span>
                .
              </p>
              {DATA_ACTION_OPTIONS.map((opt) => {
                const checked = dataActions[opt.key];
                const disabled = opt.disabled;
                const IconComp = opt.icon;

                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (disabled) return;
                      setDataActions((prev) => ({
                        ...prev,
                        [opt.key]: !prev[opt.key],
                      }));
                    }}
                    disabled={disabled}
                    className={cn(
                      "flex items-start gap-3 w-full p-3 rounded-xl border transition-colors text-left",
                      checked && !disabled
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50",
                      disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5",
                        checked && !disabled
                          ? "bg-primary border-primary"
                          : "border-border",
                      )}
                    >
                      {checked && !disabled && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <IconComp className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {opt.label}
                        </span>
                        {opt.warning && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                            Attention
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {opt.description}
                        {disabled && " (selectionne un destinataire d'abord)"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Warning */}
              <div className="flex gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs text-red-600 dark:text-red-400">
                  <p className="font-medium mb-1">
                    Cette action est irreversible
                  </p>
                  <p>
                    L'utilisateur sera archive et ne pourra plus se connecter.
                    Verifie les informations ci-dessous avant de confirmer.
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Utilisateur
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedUser?.full_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Role</span>
                  <span className="text-sm text-foreground capitalize">
                    {selectedUser?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Motif</span>
                  <span className="text-sm text-foreground text-right max-w-[60%] truncate">
                    {reason}
                  </span>
                </div>
                {transferTarget && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Transfert vers
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {transferTarget.full_name}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-2 space-y-1">
                  <span className="text-xs text-muted-foreground">
                    Actions prevues :
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {dataActions.transfer_clients && transferToId && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" /> Transfert clients
                      </span>
                    )}
                    {dataActions.transfer_channels && transferToId && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Transfert canaux
                      </span>
                    )}
                    {dataActions.archive_messages && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium flex items-center gap-1">
                        <Archive className="w-3 h-3" /> Archive messages
                      </span>
                    )}
                    {dataActions.export_data && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium flex items-center gap-1">
                        <Download className="w-3 h-3" /> Export RGPD
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium">
                      Desactivation du compte
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-4 border-t border-border">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={processing}
              className="h-10 px-4 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="h-10 px-4 rounded-[10px] bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={processing}
              className="h-10 px-5 rounded-[10px] bg-[#DC2626] text-white text-sm font-medium hover:bg-[#DC2626]/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing && <Loader2 className="w-4 h-4 animate-spin" />}
              {processing ? "Traitement..." : "Confirmer le depart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
