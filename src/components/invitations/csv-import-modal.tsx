"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  AlertTriangle,
  Loader2,
  Check,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { importCSV } from "@/lib/csv";
import { useInvitations } from "@/hooks/use-invitations";
import { ROLE_OPTIONS } from "@/types/invitations";
import type { CsvInviteRow } from "@/types/invitations";

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
}

const CSV_COLUMNS = [
  { key: "nom" as const, label: "Nom" },
  { key: "email" as const, label: "Email" },
  { key: "role" as const, label: "Role" },
];

const VALID_ROLES = ROLE_OPTIONS.map((r) => r.value);

interface ParsedRow extends CsvInviteRow {
  valid: boolean;
  errors: string[];
}

function validateRow(row: CsvInviteRow): ParsedRow {
  const errors: string[] = [];

  if (!row.nom?.trim()) {
    errors.push("Nom manquant");
  }
  if (!row.email?.trim()) {
    errors.push("Email manquant");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
    errors.push("Email invalide");
  }
  if (!row.role?.trim()) {
    errors.push("Role manquant");
  } else if (
    !(VALID_ROLES as readonly string[]).includes(row.role.trim().toLowerCase())
  ) {
    errors.push(`Role invalide (${VALID_ROLES.join(", ")})`);
  }

  return {
    ...row,
    nom: row.nom?.trim() ?? "",
    email: row.email?.trim() ?? "",
    role: row.role?.trim().toLowerCase() ?? "",
    valid: errors.length === 0,
    errors,
  };
}

export function CsvImportModal({ open, onClose }: CsvImportModalProps) {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createBulkInvitations } = useInvitations();

  if (!open) return null;

  const validRows = parsedRows.filter((r) => r.valid);
  const invalidRows = parsedRows.filter((r) => !r.valid);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const data = await importCSV<"nom" | "email" | "role">(file, CSV_COLUMNS);
      const validated = data.map(validateRow);
      setParsedRows(validated);
      setStep("preview");
    } catch {
      setParsedRows([]);
      setStep("upload");
    }
  };

  const handleImport = () => {
    const invites = validRows.map((r) => ({
      email: r.email,
      full_name: r.nom,
      role: r.role,
    }));

    createBulkInvitations.mutate(invites, {
      onSuccess: () => {
        setStep("done");
      },
    });
  };

  const handleClose = () => {
    setParsedRows([]);
    setFileName("");
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleDownloadTemplate = () => {
    const csv = "Nom,Email,Role\nJean Dupont,jean@email.com,client\n";
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele-invitations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Import CSV
              </h3>
              <p className="text-xs text-muted-foreground">
                {step === "upload" &&
                  "Importez un fichier CSV avec les invitations"}
                {step === "preview" &&
                  `${parsedRows.length} ligne(s) trouvee(s) dans ${fileName}`}
                {step === "done" && "Import termine"}
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

        {/* Upload step */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Cliquer pour selectionner un fichier CSV
              </p>
              <p className="text-xs text-muted-foreground">
                Format: Nom, Email, Role (admin, coach, setter, closer, client)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={handleDownloadTemplate}
              className="w-full h-10 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Telecharger le modele CSV
            </button>
          </div>
        )}

        {/* Preview step */}
        {step === "preview" && (
          <div className="flex flex-col flex-1 min-h-0 space-y-4">
            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex-1 p-3 bg-emerald-500/10 rounded-xl">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Valides
                </p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {validRows.length}
                </p>
              </div>
              {invalidRows.length > 0 && (
                <div className="flex-1 p-3 bg-red-500/10 rounded-xl">
                  <p className="text-xs text-red-500 font-medium">Erreurs</p>
                  <p className="text-lg font-bold text-red-500">
                    {invalidRows.length}
                  </p>
                </div>
              )}
              <div className="flex-1 p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground font-medium">
                  Total
                </p>
                <p className="text-lg font-bold text-foreground">
                  {parsedRows.length}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto border border-border rounded-xl">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 w-8">
                      #
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                      Nom
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border last:border-0",
                        !row.valid && "bg-red-500/5",
                      )}
                    >
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-foreground">
                        {row.nom || "-"}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">
                        {row.email || "-"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-foreground">
                          {(ROLE_OPTIONS.find((r) => r.value === row.role)
                            ?.label ??
                            row.role) ||
                            "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
                            <Check className="w-3 h-3" /> OK
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500"
                            title={row.errors.join(", ")}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {row.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setStep("upload");
                  setParsedRows([]);
                  setFileName("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex-1 h-10 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Changer de fichier
              </button>
              <button
                onClick={handleImport}
                disabled={
                  validRows.length === 0 || createBulkInvitations.isPending
                }
                className="flex-1 h-10 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createBulkInvitations.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {createBulkInvitations.isPending
                  ? "Import en cours..."
                  : `Importer ${validRows.length} invitation(s)`}
              </button>
            </div>
          </div>
        )}

        {/* Done step */}
        {step === "done" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Import termine !
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {validRows.length} invitation(s) creee(s) avec succes
              </p>
            </div>
            <button
              onClick={handleClose}
              className="h-10 px-6 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98]"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
