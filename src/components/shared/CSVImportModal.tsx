import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { importCSV } from "@/lib/csv";

export interface CSVColumn<T extends string = string> {
  key: T;
  label: string;
  required?: boolean;
}

interface CSVImportModalProps<T extends string> {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  columns: CSVColumn<T>[];
  onImport: (
    rows: Record<T, string>[],
  ) => Promise<{ success: number; errors: number }>;
  templateFilename?: string;
}

type ImportState = "idle" | "preview" | "importing" | "done";

export function CSVImportModal<T extends string>({
  open,
  onClose,
  title,
  description,
  columns,
  onImport,
  templateFilename = "template-import",
}: CSVImportModalProps<T>) {
  const [state, setState] = useState<ImportState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Record<T, string>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: number;
    errors: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setState("idle");
    setFile(null);
    setRows([]);
    setParseError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setParseError(null);

      if (!selectedFile.name.endsWith(".csv")) {
        setParseError("Le fichier doit être au format CSV");
        return;
      }

      try {
        const parsed = await importCSV<T>(selectedFile, columns);

        if (parsed.length === 0) {
          setParseError("Le fichier CSV est vide");
          return;
        }

        // Vérifier que les colonnes requises ont des valeurs
        const requiredCols = columns.filter((c) => c.required);
        const invalidRows = parsed.filter((row) =>
          requiredCols.some((col) => !row[col.key]?.trim()),
        );

        if (invalidRows.length > 0) {
          setParseError(
            `${invalidRows.length} ligne(s) ont des champs requis manquants (${requiredCols.map((c) => c.label).join(", ")})`,
          );
        }

        setFile(selectedFile);
        setRows(parsed);
        setState("preview");
      } catch (err) {
        setParseError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la lecture du fichier",
        );
      }
    },
    [columns],
  );

  const handleImport = useCallback(async () => {
    setState("importing");
    try {
      const res = await onImport(rows);
      setResult(res);
      setState("done");
    } catch {
      setParseError("Erreur lors de l'import");
      setState("preview");
    }
  }, [rows, onImport]);

  const handleDownloadTemplate = useCallback(() => {
    const headers = columns.map((c) => c.label).join(",");
    const exampleRow = columns
      .map((c) => (c.required ? "exemple" : ""))
      .join(",");
    const csv = `${headers}\n${exampleRow}`;
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${templateFilename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [columns, templateFilename]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Simuler un changement de fichier
      const dt = new DataTransfer();
      dt.items.add(droppedFile);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        fileInputRef.current.dispatchEvent(
          new Event("change", { bubbles: true }),
        );
      }
    }
  }, []);

  // Nombre de colonnes visibles dans le preview (max 5)
  const previewCols = columns.slice(0, 5);
  const previewRows = rows.slice(0, 5);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      size="lg"
    >
      {state === "idle" && (
        <div className="space-y-4">
          {/* Zone de drop */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
              "border-border/60 hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground/60" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Glissez votre fichier CSV ici
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ou cliquez pour sélectionner
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              style={{ position: "relative" }}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Choisir un fichier
            </Button>
          </div>

          {parseError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{parseError}</p>
            </div>
          )}

          {/* Template download */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Colonnes attendues : {columns.map((c) => c.label).join(", ")}
              </span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Download className="h-3 w-3" />
              Template
            </button>
          </div>
        </div>
      )}

      {state === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{file?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {rows.length} ligne{rows.length > 1 ? "s" : ""} détectée
                {rows.length > 1 ? "s" : ""}
              </span>
              <button
                onClick={reset}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {parseError && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-700">{parseError}</p>
            </div>
          )}

          {/* Preview table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {previewCols.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2 text-left font-medium text-muted-foreground"
                    >
                      {col.label}
                      {col.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </th>
                  ))}
                  {columns.length > 5 && (
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      ...
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {previewCols.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-2 text-foreground truncate max-w-[150px]"
                      >
                        {row[col.key] || (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                    ))}
                    {columns.length > 5 && (
                      <td className="px-3 py-2 text-muted-foreground">...</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && (
              <div className="border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                ... et {rows.length - 5} autres lignes
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={reset}>
              Annuler
            </Button>
            <Button
              onClick={handleImport}
              icon={<Upload className="h-4 w-4" />}
            >
              Importer {rows.length} ligne{rows.length > 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      )}

      {state === "importing" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Import en cours...</p>
        </div>
      )}

      {state === "done" && result && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                Import terminé
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.success} ligne{result.success > 1 ? "s" : ""} importée
                {result.success > 1 ? "s" : ""} avec succès
                {result.errors > 0 && (
                  <span className="text-destructive">
                    , {result.errors} erreur{result.errors > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Fermer</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
