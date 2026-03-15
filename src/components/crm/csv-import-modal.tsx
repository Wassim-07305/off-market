"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Check,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCsvParser,
  useAutoMapping,
  useImportContacts,
  downloadCsvTemplate,
  CRM_FIELDS,
  type ColumnMapping,
  type ImportOptions,
} from "@/hooks/use-csv-import";
import {
  PIPELINE_STAGES,
  CONTACT_SOURCES,
  type PipelineStage,
  type ContactSource,
} from "@/types/pipeline";

// ─── Step indicator ──────────────────────────────────────────

const STEPS = [
  { key: "upload", label: "Fichier" },
  { key: "mapping", label: "Colonnes" },
  { key: "preview", label: "Apercu" },
  { key: "import", label: "Import" },
] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-1">
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
              i === current
                ? "bg-red-600/10 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                : i < current
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
            )}
          >
            {i < current ? (
              <Check className="w-3 h-3" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-current text-[10px] flex items-center justify-center font-mono">
                {i + 1}
              </span>
            )}
            {step.label}
          </div>
          {i < STEPS.length - 1 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Upload ──────────────────────────────────────────

function UploadStep({
  onFileSelect,
  parsing,
  error,
  fileName,
  fileSize,
  rowCount,
  columnCount,
}: {
  onFileSelect: (file: File) => void;
  parsing: boolean;
  error: string | null;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.name.endsWith(".tsv"))) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-5">
      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200",
          dragOver
            ? "border-red-500 bg-red-500/5"
            : fileName
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-border hover:border-red-500/30 hover:bg-muted/50",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv"
          onChange={handleFileChange}
          className="hidden"
        />

        {parsing ? (
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        ) : fileName ? (
          <FileSpreadsheet className="w-10 h-10 text-emerald-500" />
        ) : (
          <Upload className="w-10 h-10 text-muted-foreground" />
        )}

        {fileName ? (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatFileSize(fileSize)} &middot; {rowCount} ligne
              {rowCount !== 1 ? "s" : ""} &middot; {columnCount} colonne
              {columnCount !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
              Fichier charge avec succes
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Glisser-deposer un fichier CSV
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou cliquer pour parcourir (.csv, .tsv)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Template download */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          downloadCsvTemplate();
        }}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Download className="w-4 h-4" />
        Telecharger le template CSV
      </button>
    </div>
  );
}

// ─── Step 2: Column Mapping ──────────────────────────────────

function MappingStep({
  columns,
  mapping,
  onUpdateMapping,
  hasFirstLastName,
}: {
  columns: { header: string; sample: string[] }[];
  mapping: ColumnMapping;
  onUpdateMapping: (csvCol: string, crmField: string | null) => void;
  hasFirstLastName: boolean;
}) {
  const usedFields = useMemo(() => {
    const used = new Set<string>();
    for (const val of Object.values(mapping)) {
      if (val && !val.startsWith("__")) used.add(val);
    }
    return used;
  }, [mapping]);

  const hasFullName = usedFields.has("full_name") || hasFirstLastName;

  return (
    <div className="space-y-4">
      {hasFirstLastName && (
        <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Colonnes &laquo; Prenom &raquo; et &laquo; Nom &raquo; detectees —
            elles seront combinees en &laquo; Nom complet &raquo;
            automatiquement.
          </p>
        </div>
      )}

      {!hasFullName && (
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Le champ &laquo; Nom complet &raquo; est requis. Assignez une
            colonne a ce champ pour continuer.
          </p>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {columns.map((col) => {
          const currentMapping = mapping[col.header];
          const isAutoDetected = currentMapping !== null;
          const isSpecial =
            currentMapping === "__first_name" ||
            currentMapping === "__last_name";

          return (
            <div
              key={col.header}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                isSpecial
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : isAutoDetected
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-border bg-surface",
              )}
            >
              {/* CSV column */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {col.header}
                </p>
                {col.sample.length > 0 && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {col.sample.slice(0, 2).join(", ")}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />

              {/* CRM field dropdown */}
              <div className="w-[200px] shrink-0">
                {isSpecial ? (
                  <div className="h-9 px-3 flex items-center text-sm text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 rounded-lg">
                    {currentMapping === "__first_name"
                      ? "Prenom → Nom complet"
                      : "Nom → Nom complet"}
                  </div>
                ) : (
                  <select
                    value={currentMapping ?? "__skip"}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateMapping(
                        col.header,
                        val === "__skip" ? null : val,
                      );
                    }}
                    className={cn(
                      "w-full h-9 px-3 rounded-lg text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-red-600/20",
                      isAutoDetected
                        ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    <option value="__skip">Ignorer</option>
                    {CRM_FIELDS.map((field) => (
                      <option
                        key={field.key}
                        value={field.key}
                        disabled={
                          usedFields.has(field.key) &&
                          currentMapping !== field.key
                        }
                      >
                        {field.label}
                        {field.required ? " *" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Preview & Options ───────────────────────────────

function PreviewStep({
  rows,
  mapping,
  options,
  onUpdateOptions,
  hasFirstLastName,
  firstNameColumn,
  lastNameColumn,
  validationSummary,
}: {
  rows: Record<string, string>[];
  mapping: ColumnMapping;
  options: ImportOptions;
  onUpdateOptions: (opts: Partial<ImportOptions>) => void;
  hasFirstLastName: boolean;
  firstNameColumn: string | null;
  lastNameColumn: string | null;
  validationSummary: {
    valid: number;
    invalid: number;
    duplicateEmails: number;
  };
}) {
  // Build preview rows
  const previewRows = useMemo(() => {
    const fieldToColumn: Record<string, string> = {};
    for (const [csvCol, crmField] of Object.entries(mapping)) {
      if (crmField && !crmField.startsWith("__")) {
        fieldToColumn[crmField] = csvCol;
      }
    }

    return rows.slice(0, 5).map((row) => {
      const preview: Record<string, string> = {};

      // full_name
      if (hasFirstLastName && firstNameColumn && lastNameColumn) {
        preview.full_name = [
          (row[firstNameColumn] ?? "").trim(),
          (row[lastNameColumn] ?? "").trim(),
        ]
          .filter(Boolean)
          .join(" ");
      } else if (fieldToColumn.full_name) {
        preview.full_name = row[fieldToColumn.full_name] ?? "";
      }

      for (const field of CRM_FIELDS) {
        if (field.key === "full_name") continue;
        if (fieldToColumn[field.key]) {
          preview[field.key] = row[fieldToColumn[field.key]] ?? "";
        }
      }

      return preview;
    });
  }, [rows, mapping, hasFirstLastName, firstNameColumn, lastNameColumn]);

  // Active mapped fields for table headers
  const activeFields = useMemo(() => {
    const fields: { key: string; label: string }[] = [];
    const mappedKeys = new Set(
      Object.values(mapping).filter((v) => v !== null && !v.startsWith("__")),
    );
    if (hasFirstLastName) mappedKeys.add("full_name");

    for (const field of CRM_FIELDS) {
      if (mappedKeys.has(field.key)) {
        fields.push({ key: field.key, label: field.label });
      }
    }
    return fields;
  }, [mapping, hasFirstLastName]);

  return (
    <div className="space-y-5">
      {/* Validation summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {validationSummary.valid}
          </p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
            Lignes valides
          </p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {validationSummary.invalid}
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
            Champ requis manquant
          </p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-500/10 border border-zinc-500/20 text-center">
          <p className="text-lg font-semibold text-foreground font-mono tabular-nums">
            {validationSummary.duplicateEmails}
          </p>
          <p className="text-xs text-muted-foreground">Emails en doublon</p>
        </div>
      </div>

      {/* Preview table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                {activeFields.map((f) => (
                  <th
                    key={f.key}
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {previewRows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  {activeFields.map((f) => (
                    <td
                      key={f.key}
                      className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate"
                    >
                      {row[f.key] || (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 5 && (
          <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground text-center border-t border-border">
            ... et {rows.length - 5} autre{rows.length - 5 !== 1 ? "s" : ""}{" "}
            ligne{rows.length - 5 !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">
          Options d'import
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Etape par defaut
            </label>
            <select
              value={options.defaultStage}
              onChange={(e) =>
                onUpdateOptions({
                  defaultStage: e.target.value as PipelineStage,
                })
              }
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Source par defaut
            </label>
            <select
              value={options.defaultSource}
              onChange={(e) =>
                onUpdateOptions({
                  defaultSource: e.target.value as ContactSource,
                })
              }
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
            >
              {CONTACT_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Gestion des doublons (par email)
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateOptions({ duplicateHandling: "skip" })}
              className={cn(
                "flex-1 h-9 rounded-lg text-sm font-medium border transition-colors",
                options.duplicateHandling === "skip"
                  ? "bg-red-600/10 border-red-600/30 text-red-600 dark:text-red-400"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Ignorer les doublons
            </button>
            <button
              onClick={() => onUpdateOptions({ duplicateHandling: "update" })}
              className={cn(
                "flex-1 h-9 rounded-lg text-sm font-medium border transition-colors",
                options.duplicateHandling === "update"
                  ? "bg-red-600/10 border-red-600/30 text-red-600 dark:text-red-400"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Mettre a jour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Import Progress ─────────────────────────────────

function ImportStep({
  progress,
  onViewPipeline,
  onReset,
}: {
  progress: {
    total: number;
    imported: number;
    skipped: number;
    updated: number;
    errors: { row: number; message: string }[];
    done: boolean;
  };
  onViewPipeline: () => void;
  onReset: () => void;
}) {
  const processed =
    progress.imported +
    progress.skipped +
    progress.updated +
    progress.errors.length;
  const pct =
    progress.total > 0 ? Math.round((processed / progress.total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">
            {progress.done ? "Import termine" : "Import en cours..."}
          </span>
          <span className="text-muted-foreground font-mono tabular-nums">
            {pct}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              progress.done
                ? progress.errors.length > 0
                  ? "bg-amber-500"
                  : "bg-emerald-500"
                : "bg-red-600",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-muted/50 text-center">
          <p className="text-lg font-semibold text-foreground font-mono tabular-nums">
            {progress.total}
          </p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 text-center">
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {progress.imported}
          </p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
            Importes
          </p>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10 text-center">
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
            {progress.updated}
          </p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
            Mis a jour
          </p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-500/10 text-center">
          <p className="text-lg font-semibold text-foreground font-mono tabular-nums">
            {progress.skipped}
          </p>
          <p className="text-xs text-muted-foreground">Ignores</p>
        </div>
      </div>

      {/* Errors log */}
      {progress.errors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {progress.errors.length} erreur
            {progress.errors.length !== 1 ? "s" : ""}
          </p>
          <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1">
            {progress.errors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-xs"
              >
                <span className="text-red-500 font-mono shrink-0">
                  L.{err.row}
                </span>
                <span className="text-red-600 dark:text-red-400">
                  {err.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {progress.done && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={onReset}
            className="flex-1 h-10 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Nouvel import
          </button>
          <button
            onClick={onViewPipeline}
            className="flex-1 h-10 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            Voir le pipeline
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────

export function CsvImportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [options, setOptions] = useState<ImportOptions>({
    defaultStage: "prospect",
    defaultSource: "other",
    duplicateHandling: "skip",
  });

  const parser = useCsvParser();
  const { computeMapping } = useAutoMapping();
  const { progress, importContacts, resetProgress } = useImportContacts();

  // Handle file select
  const handleFileSelect = useCallback(
    (file: File) => {
      parser.parseFile(file);
      // Auto-mapping will be computed when moving to step 2
    },
    [parser],
  );

  // Compute validation summary
  const validationSummary = useMemo(() => {
    if (parser.rows.length === 0)
      return { valid: 0, invalid: 0, duplicateEmails: 0 };

    const fieldToColumn: Record<string, string> = {};
    for (const [csvCol, crmField] of Object.entries(mapping)) {
      if (crmField && !crmField.startsWith("__")) {
        fieldToColumn[crmField] = csvCol;
      }
    }

    let valid = 0;
    let invalid = 0;
    const emails = new Set<string>();
    let duplicateEmails = 0;

    for (const row of parser.rows) {
      let hasName = false;

      if (
        parser.hasFirstLastName &&
        parser.firstNameColumn &&
        parser.lastNameColumn
      ) {
        const first = (row[parser.firstNameColumn] ?? "").trim();
        const last = (row[parser.lastNameColumn] ?? "").trim();
        hasName = !!(first || last);
      } else if (fieldToColumn.full_name) {
        hasName = !!(row[fieldToColumn.full_name] ?? "").trim();
      }

      if (hasName) {
        valid++;
      } else {
        invalid++;
      }

      // Check email duplicates
      if (fieldToColumn.email) {
        const email = (row[fieldToColumn.email] ?? "").trim().toLowerCase();
        if (email) {
          if (emails.has(email)) {
            duplicateEmails++;
          } else {
            emails.add(email);
          }
        }
      }
    }

    return { valid, invalid, duplicateEmails };
  }, [
    parser.rows,
    mapping,
    parser.hasFirstLastName,
    parser.firstNameColumn,
    parser.lastNameColumn,
  ]);

  // Can proceed to next step?
  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return parser.rows.length > 0 && !parser.parsing && !parser.error;
      case 1: {
        // Need full_name mapped (either direct or via first+last)
        const hasFullName =
          parser.hasFirstLastName ||
          Object.values(mapping).includes("full_name");
        return hasFullName;
      }
      case 2:
        return validationSummary.valid > 0;
      default:
        return false;
    }
  }, [step, parser, mapping, validationSummary]);

  const handleNext = useCallback(() => {
    if (step === 0) {
      // Compute auto-mapping when entering step 2
      const autoMapping = computeMapping(
        parser.columns,
        parser.hasFirstLastName,
        parser.firstNameColumn,
        parser.lastNameColumn,
      );
      setMapping(autoMapping);
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      // Start import
      importContacts.mutate({
        rows: parser.rows,
        mapping,
        options,
        hasFirstLastName: parser.hasFirstLastName,
        firstNameColumn: parser.firstNameColumn,
        lastNameColumn: parser.lastNameColumn,
      });
    }
  }, [step, computeMapping, parser, mapping, options, importContacts]);

  const handleBack = useCallback(() => {
    if (step > 0 && step < 3) {
      setStep(step - 1);
    }
  }, [step]);

  const handleReset = useCallback(() => {
    parser.reset();
    setMapping({});
    setOptions({
      defaultStage: "prospect",
      defaultSource: "other",
      duplicateHandling: "skip",
    });
    resetProgress();
    setStep(0);
  }, [parser, resetProgress]);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface border border-border rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Importer des contacts
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Importez vos contacts depuis un fichier CSV
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b border-border shrink-0">
          <StepIndicator current={step} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <UploadStep
              onFileSelect={handleFileSelect}
              parsing={parser.parsing}
              error={parser.error}
              fileName={parser.fileName}
              fileSize={parser.fileSize}
              rowCount={parser.rows.length}
              columnCount={parser.columns.length}
            />
          )}

          {step === 1 && (
            <MappingStep
              columns={parser.columns}
              mapping={mapping}
              onUpdateMapping={(csvCol, crmField) => {
                setMapping((prev) => ({ ...prev, [csvCol]: crmField }));
              }}
              hasFirstLastName={parser.hasFirstLastName}
            />
          )}

          {step === 2 && (
            <PreviewStep
              rows={parser.rows}
              mapping={mapping}
              options={options}
              onUpdateOptions={(opts) =>
                setOptions((prev) => ({ ...prev, ...opts }))
              }
              hasFirstLastName={parser.hasFirstLastName}
              firstNameColumn={parser.firstNameColumn}
              lastNameColumn={parser.lastNameColumn}
              validationSummary={validationSummary}
            />
          )}

          {step === 3 && (
            <ImportStep
              progress={progress}
              onViewPipeline={handleClose}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer with nav buttons */}
        {step < 3 && (
          <div className="flex items-center justify-between p-6 pt-4 border-t border-border shrink-0">
            <button
              onClick={step === 0 ? handleClose : handleBack}
              className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              {step === 0 ? (
                "Annuler"
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="h-9 px-5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {step === 2 ? (
                <>
                  Lancer l'import
                  <Upload className="w-4 h-4" />
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
