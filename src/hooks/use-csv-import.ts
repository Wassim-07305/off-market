"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import Papa from "papaparse";
import type { PipelineStage, ContactSource } from "@/types/pipeline";

// ─── Types ────────────────────────────────────────────────────

export interface CsvColumn {
  header: string;
  sample: string[];
}

export interface ColumnMapping {
  [csvColumn: string]: string | null;
}

export interface ImportOptions {
  defaultStage: PipelineStage;
  defaultSource: ContactSource;
  duplicateHandling: "skip" | "update";
}

export interface ImportProgress {
  total: number;
  imported: number;
  skipped: number;
  updated: number;
  errors: { row: number; message: string }[];
  done: boolean;
}

export const CRM_FIELDS = [
  { key: "full_name", label: "Nom complet", required: true },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Telephone", required: false },
  { key: "company", label: "Entreprise", required: false },
  { key: "source", label: "Source", required: false },
  { key: "stage", label: "Étape pipeline", required: false },
  { key: "estimated_value", label: "Valeur estimee", required: false },
  { key: "notes", label: "Notes", required: false },
  { key: "tags", label: "Tags (separes par virgule)", required: false },
  { key: "linkedin_url", label: "LinkedIn URL", required: false },
  { key: "instagram_url", label: "Instagram URL", required: false },
  { key: "tiktok_url", label: "TikTok URL", required: false },
  { key: "facebook_url", label: "Facebook URL", required: false },
  { key: "website_url", label: "Site web URL", required: false },
] as const;

export type CrmFieldKey = (typeof CRM_FIELDS)[number]["key"];

// ─── Auto-mapping dictionary ──────────────────────────────────

const COLUMN_ALIASES: Record<CrmFieldKey, string[]> = {
  full_name: [
    "full_name",
    "fullname",
    "nom complet",
    "nom_complet",
    "name",
    "nom",
    "contact",
    "contact name",
    "nom du contact",
  ],
  email: [
    "email",
    "e-mail",
    "mail",
    "courriel",
    "adresse email",
    "adresse mail",
    "email address",
  ],
  phone: [
    "phone",
    "telephone",
    "tel",
    "tel.",
    "mobile",
    "portable",
    "numéro",
    "phone number",
    "numéro de telephone",
  ],
  company: [
    "company",
    "entreprise",
    "societe",
    "organisation",
    "org",
    "niche",
    "business",
    "company name",
    "nom entreprise",
  ],
  source: ["source", "origine", "canal", "channel", "provenance"],
  stage: ["stage", "étape", "statut", "status", "pipeline", "phase"],
  estimated_value: [
    "estimated_value",
    "valeur",
    "valeur estimee",
    "value",
    "montant",
    "deal value",
    "amount",
    "prix",
    "price",
    "ca",
    "revenue",
  ],
  notes: [
    "notes",
    "note",
    "commentaire",
    "commentaires",
    "comment",
    "comments",
    "description",
    "remarques",
  ],
  tags: ["tags", "tag", "etiquettes", "labels", "catégories"],
  linkedin_url: [
    "linkedin_url",
    "linkedin",
    "profil linkedin",
    "linkedin url",
    "linkedin profile",
  ],
  instagram_url: [
    "instagram_url",
    "instagram",
    "insta",
    "profil instagram",
    "instagram url",
  ],
  tiktok_url: ["tiktok_url", "tiktok", "tik tok", "profil tiktok"],
  facebook_url: ["facebook_url", "facebook", "fb", "profil facebook"],
  website_url: [
    "website_url",
    "website",
    "site",
    "site web",
    "url",
    "site internet",
    "web",
  ],
};

// Special columns that combine into full_name
const FIRST_NAME_ALIASES = [
  "prenom",
  "prénom",
  "first_name",
  "firstname",
  "first name",
  "given name",
];
const LAST_NAME_ALIASES = [
  "nom",
  "nom de famille",
  "last_name",
  "lastname",
  "last name",
  "family name",
  "surname",
];

// ─── Valid values ─────────────────────────────────────────────

const VALID_STAGES: PipelineStage[] = [
  "prospect",
  "qualifie",
  "proposition",
  "closing",
  "client",
  "perdu",
];
const VALID_SOURCES: ContactSource[] = [
  "instagram",
  "linkedin",
  "referral",
  "website",
  "lead_magnet",
  "other",
];

// ─── Hook: CSV Parser ─────────────────────────────────────────

export function useCsvParser() {
  const [columns, setColumns] = useState<CsvColumn[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect if columns contain first/last name split
  const [hasFirstLastName, setHasFirstLastName] = useState(false);
  const [firstNameColumn, setFirstNameColumn] = useState<string | null>(null);
  const [lastNameColumn, setLastNameColumn] = useState<string | null>(null);

  const parseFile = useCallback((file: File) => {
    setParsing(true);
    setError(null);
    setFileName(file.name);
    setFileSize(file.size);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(results.errors[0].message);
          setParsing(false);
          return;
        }

        const headers = results.meta.fields ?? [];
        const data = results.data;

        // Build column info with samples
        const cols: CsvColumn[] = headers.map((header) => ({
          header,
          sample: data
            .slice(0, 3)
            .map((row) => row[header] ?? "")
            .filter((v) => v.trim() !== ""),
        }));

        // Detect first/last name columns
        const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
        const fnIdx = normalizedHeaders.findIndex((h) =>
          FIRST_NAME_ALIASES.includes(h),
        );
        const lnIdx = normalizedHeaders.findIndex((h) =>
          LAST_NAME_ALIASES.includes(h),
        );

        if (fnIdx !== -1 && lnIdx !== -1) {
          setHasFirstLastName(true);
          setFirstNameColumn(headers[fnIdx]);
          setLastNameColumn(headers[lnIdx]);
        } else {
          setHasFirstLastName(false);
          setFirstNameColumn(null);
          setLastNameColumn(null);
        }

        setColumns(cols);
        setRows(data);
        setParsing(false);
      },
      error: (err) => {
        setError(err.message);
        setParsing(false);
      },
    });
  }, []);

  const reset = useCallback(() => {
    setColumns([]);
    setRows([]);
    setFileName("");
    setFileSize(0);
    setError(null);
    setHasFirstLastName(false);
    setFirstNameColumn(null);
    setLastNameColumn(null);
  }, []);

  return {
    columns,
    rows,
    fileName,
    fileSize,
    parsing,
    error,
    hasFirstLastName,
    firstNameColumn,
    lastNameColumn,
    parseFile,
    reset,
  };
}

// ─── Hook: Auto-mapping ──────────────────────────────────────

export function useAutoMapping() {
  const computeMapping = useCallback(
    (
      columns: CsvColumn[],
      hasFirstLastName: boolean,
      firstNameCol: string | null,
      lastNameCol: string | null,
    ): ColumnMapping => {
      const mapping: ColumnMapping = {};
      const usedFields = new Set<string>();

      for (const col of columns) {
        const normalized = col.header.toLowerCase().trim();

        // Skip first/last name columns if they'll be merged
        if (
          hasFirstLastName &&
          ((firstNameCol && col.header === firstNameCol) ||
            (lastNameCol && col.header === lastNameCol))
        ) {
          // These will be handled as __first_name / __last_name
          if (firstNameCol && col.header === firstNameCol) {
            mapping[col.header] = "__first_name";
          } else {
            mapping[col.header] = "__last_name";
          }
          continue;
        }

        // Try to match against aliases
        let matched = false;
        for (const [fieldKey, aliases] of Object.entries(COLUMN_ALIASES)) {
          if (usedFields.has(fieldKey)) continue;
          if (aliases.includes(normalized)) {
            mapping[col.header] = fieldKey;
            usedFields.add(fieldKey);
            matched = true;
            break;
          }
        }

        if (!matched) {
          mapping[col.header] = null; // Skip by default
        }
      }

      return mapping;
    },
    [],
  );

  return { computeMapping };
}

// ─── Hook: Import Contacts ───────────────────────────────────

export function useImportContacts() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    imported: 0,
    skipped: 0,
    updated: 0,
    errors: [],
    done: false,
  });

  const importMutation = useMutation({
    mutationFn: async ({
      rows,
      mapping,
      options,
      hasFirstLastName,
      firstNameColumn,
      lastNameColumn,
    }: {
      rows: Record<string, string>[];
      mapping: ColumnMapping;
      options: ImportOptions;
      hasFirstLastName: boolean;
      firstNameColumn: string | null;
      lastNameColumn: string | null;
    }) => {
      if (!user) throw new Error("Non authentifie");

      const total = rows.length;
      let imported = 0;
      let skipped = 0;
      let updated = 0;
      const errors: { row: number; message: string }[] = [];

      setProgress({
        total,
        imported: 0,
        skipped: 0,
        updated: 0,
        errors: [],
        done: false,
      });

      // Build reverse mapping: crm field -> csv column(s)
      const fieldToColumn: Record<string, string> = {};
      for (const [csvCol, crmField] of Object.entries(mapping)) {
        if (crmField && !crmField.startsWith("__")) {
          fieldToColumn[crmField] = csvCol;
        }
      }

      // Process rows into contact objects
      const contacts: Array<{
        rowIndex: number;
        data: Record<string, unknown>;
      }> = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const contact: Record<string, unknown> = {
            created_by: user.id,
            assigned_to: user.id,
          };

          // Handle full_name: either direct mapping or first+last merge
          if (hasFirstLastName && firstNameColumn && lastNameColumn) {
            const firstName = (row[firstNameColumn] ?? "").trim();
            const lastName = (row[lastNameColumn] ?? "").trim();
            contact.full_name = [firstName, lastName].filter(Boolean).join(" ");
          } else if (fieldToColumn.full_name) {
            contact.full_name = (row[fieldToColumn.full_name] ?? "").trim();
          }

          if (!contact.full_name) {
            errors.push({ row: i + 2, message: "Nom complet manquant" });
            continue;
          }

          // Map other fields
          for (const [field, csvCol] of Object.entries(fieldToColumn)) {
            if (field === "full_name") continue;
            const value = (row[csvCol] ?? "").trim();
            if (!value) continue;

            switch (field) {
              case "email":
              case "phone":
              case "company":
              case "notes":
              case "linkedin_url":
              case "instagram_url":
              case "tiktok_url":
              case "facebook_url":
              case "website_url":
                contact[field] = value;
                break;
              case "source": {
                const normalizedSource = value.toLowerCase().trim();
                if (VALID_SOURCES.includes(normalizedSource as ContactSource)) {
                  contact.source = normalizedSource;
                } else {
                  contact.source = options.defaultSource;
                }
                break;
              }
              case "stage": {
                const normalizedStage = value.toLowerCase().trim();
                if (VALID_STAGES.includes(normalizedStage as PipelineStage)) {
                  contact.stage = normalizedStage;
                } else {
                  contact.stage = options.defaultStage;
                }
                break;
              }
              case "estimated_value": {
                const numVal = parseFloat(
                  value.replace(/[^\d.,\-]/g, "").replace(",", "."),
                );
                if (!isNaN(numVal)) {
                  contact.estimated_value = numVal;
                }
                break;
              }
              case "tags": {
                const tagList = value
                  .split(/[,;|]/)
                  .map((t) => t.trim())
                  .filter(Boolean);
                if (tagList.length > 0) {
                  contact.tags = tagList;
                }
                break;
              }
            }
          }

          // Apply defaults if not set
          if (!contact.stage) contact.stage = options.defaultStage;
          if (!contact.source) contact.source = options.defaultSource;

          contacts.push({ rowIndex: i + 2, data: contact });
        } catch {
          errors.push({
            row: i + 2,
            message: "Erreur de traitement de la ligne",
          });
        }
      }

      // Import in batches of 50
      const BATCH_SIZE = 50;

      for (let batch = 0; batch < contacts.length; batch += BATCH_SIZE) {
        const batchContacts = contacts.slice(batch, batch + BATCH_SIZE);

        for (const { rowIndex, data } of batchContacts) {
          try {
            const email = data.email as string | undefined;

            // Check for duplicates by email
            if (email && options.duplicateHandling !== "update") {
              const { data: existing } = await supabase
                .from("crm_contacts")
                .select("id")
                .eq("email", email)
                .maybeSingle();

              if (existing) {
                skipped++;
                setProgress((p) => ({ ...p, skipped: skipped }));
                continue;
              }
            }

            if (email && options.duplicateHandling === "update") {
              const { data: existing } = await supabase
                .from("crm_contacts")
                .select("id")
                .eq("email", email)
                .maybeSingle();

              if (existing) {
                // Update existing contact (don't overwrite created_by/assigned_to)
                const {
                  created_by: _cb,
                  assigned_to: _at,
                  ...updateData
                } = data as Record<string, unknown>;
                const { error: updateError } = await supabase
                  .from("crm_contacts")
                  .update(updateData as never)
                  .eq("id", (existing as { id: string }).id);

                if (updateError) {
                  errors.push({ row: rowIndex, message: updateError.message });
                } else {
                  updated++;
                }
                setProgress((p) => ({
                  ...p,
                  updated,
                  errors: [...errors],
                }));
                continue;
              }
            }

            // Insert new contact
            const { error: insertError } = await supabase
              .from("crm_contacts")
              .insert(data as never);

            if (insertError) {
              errors.push({ row: rowIndex, message: insertError.message });
            } else {
              imported++;
            }
          } catch (err) {
            errors.push({
              row: rowIndex,
              message: err instanceof Error ? err.message : "Erreur inconnue",
            });
          }

          setProgress({
            total,
            imported,
            skipped,
            updated,
            errors: [...errors],
            done: false,
          });
        }
      }

      const finalProgress: ImportProgress = {
        total,
        imported,
        skipped,
        updated,
        errors,
        done: true,
      };
      setProgress(finalProgress);
      return finalProgress;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      if (result.errors.length === 0) {
        toast.success(
          `${result.imported} contact${result.imported !== 1 ? "s" : ""} importe${result.imported !== 1 ? "s" : ""}${result.updated > 0 ? `, ${result.updated} mis à jour` : ""}${result.skipped > 0 ? `, ${result.skipped} ignore${result.skipped !== 1 ? "s" : ""}` : ""}`,
        );
      } else {
        toast.warning(
          `Import terminé avec ${result.errors.length} erreur${result.errors.length !== 1 ? "s" : ""}`,
        );
      }
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de l'import";
      toast.error(msg);
    },
  });

  const resetProgress = useCallback(() => {
    setProgress({
      total: 0,
      imported: 0,
      skipped: 0,
      updated: 0,
      errors: [],
      done: false,
    });
  }, []);

  return {
    progress,
    importContacts: importMutation,
    resetProgress,
  };
}

// ─── Template CSV download ───────────────────────────────────

export function downloadCsvTemplate() {
  const headers = [
    "Nom complet",
    "Email",
    "Telephone",
    "Entreprise",
    "Source",
    "Étape",
    "Valeur estimee",
    "Notes",
    "Tags",
    "LinkedIn URL",
    "Instagram URL",
    "TikTok URL",
    "Facebook URL",
    "Site web URL",
  ];

  const sampleRows = [
    [
      "Jean Dupont",
      "jean@example.com",
      "+33 6 12 34 56 78",
      "Coaching Pro",
      "linkedin",
      "prospect",
      "3000",
      "Contact via DM",
      "coach,fitness",
      "https://linkedin.com/in/jean",
      "",
      "",
      "",
      "https://jeancoach.com",
    ],
    [
      "Marie Martin",
      "marie@example.com",
      "+33 7 00 00 00 00",
      "Bien-etre SAS",
      "instagram",
      "qualifie",
      "5000",
      "Interessee par le programme",
      "yoga,premium",
      "",
      "https://instagram.com/marie",
      "",
      "",
      "",
    ],
  ];

  const csv = Papa.unparse({
    fields: headers,
    data: sampleRows,
  });

  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "template-import-contacts.csv";
  link.click();
  URL.revokeObjectURL(url);
}
