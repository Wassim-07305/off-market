"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  financialEntrySchema,
  type FinancialEntryFormData,
} from "@/types/forms";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  useCreateEntry,
  useUpdateEntry,
  useFinancialEntries,
  useClientProfiles,
} from "@/hooks/use-financial-entries";

interface FinancialEntryModalProps {
  open: boolean;
  onClose: () => void;
  entryId?: string | null;
}

export function FinancialEntryModal({
  open,
  onClose,
  entryId,
}: FinancialEntryModalProps) {
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const { data: entries = [] } = useFinancialEntries();
  const { data: clients = [] } = useClientProfiles();

  const editingEntry = entryId ? entries.find((e) => e.id === entryId) : null;
  const isEdit = !!editingEntry;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FinancialEntryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(financialEntrySchema) as any,
    defaultValues: {
      client_id: "",
      type: "ca",
      label: "",
      amount: 0,
      prestataire: "",
      is_paid: false,
      date: new Date().toISOString().split("T")[0],
      recurrence: null,
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (editingEntry) {
      reset({
        client_id: editingEntry.client_id ?? "",
        type: editingEntry.type as FinancialEntryFormData["type"],
        label: editingEntry.label,
        amount: editingEntry.amount,
        prestataire: editingEntry.prestataire ?? "",
        is_paid: editingEntry.is_paid,
        date: editingEntry.date,
        recurrence: editingEntry.recurrence ?? null,
      });
    } else {
      reset({
        client_id: "",
        type: "ca",
        label: "",
        amount: 0,
        prestataire: "",
        is_paid: false,
        date: new Date().toISOString().split("T")[0],
        recurrence: null,
      });
    }
  }, [editingEntry, reset]);

  const clientOptions = [
    { value: "", label: "Aucun client" },
    ...clients.map((c) => ({ value: c.id, label: c.full_name || c.email })),
  ];

  const typeOptions = [
    { value: "ca", label: "CA (Chiffre d'affaires)" },
    { value: "récurrent", label: "Recurrent" },
    { value: "charge", label: "Charge" },
    { value: "prestataire", label: "Prestataire" },
  ];

  const recurrenceOptions = [
    { value: "", label: "Pas de recurrence" },
    { value: "mensuel", label: "Mensuel" },
    { value: "trimestriel", label: "Trimestriel" },
    { value: "annuel", label: "Annuel" },
  ];

  const onSubmit: SubmitHandler<FinancialEntryFormData> = async (data) => {
    try {
      if (isEdit && entryId) {
        await updateEntry.mutateAsync({
          id: entryId,
          client_id: data.client_id || null,
          type: data.type,
          label: data.label,
          amount: data.amount,
          prestataire: data.prestataire || null,
          is_paid: data.is_paid,
          date: data.date,
          recurrence: data.recurrence || null,
        });
      } else {
        await createEntry.mutateAsync({
          client_id: data.client_id || null,
          type: data.type,
          label: data.label,
          amount: data.amount,
          prestataire: data.prestataire || undefined,
          is_paid: data.is_paid,
          date: data.date,
          recurrence: data.recurrence || null,
        });
      }
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier l'entree" : "Nouvelle entree financiere"}
      description={
        isEdit
          ? "Modifiez les informations de cette entree."
          : "Ajoutez une nouvelle entree au suivi financier."
      }
      size="lg"
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
        <Input
          label="Description"
          placeholder="Ex: Accompagnement coaching 3 mois"
          error={errors.label?.message}
          {...register("label")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            options={typeOptions}
            value={selectedType}
            onChange={(v) =>
              setValue("type", v as FinancialEntryFormData["type"])
            }
            error={errors.type?.message}
          />
          <Input
            label="Montant"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            iconRight={
              <span className="text-xs text-muted-foreground">EUR</span>
            }
            error={errors.amount?.message}
            {...register("amount", { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Client"
            options={clientOptions}
            value={watch("client_id") ?? ""}
            onChange={(v) => setValue("client_id", v)}
            error={errors.client_id?.message}
          />
          <Input
            label="Prestataire"
            placeholder="Nom du prestataire (optionnel)"
            {...register("prestataire")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            error={errors.date?.message}
            {...register("date")}
          />
          <Select
            label="Recurrence"
            options={recurrenceOptions}
            value={watch("recurrence") ?? ""}
            onChange={(v) =>
              setValue(
                "recurrence",
                (v || null) as FinancialEntryFormData["recurrence"],
              )
            }
          />
        </div>

        <Checkbox
          label="Paye"
          description="Cochez si le paiement a ete recu"
          checked={watch("is_paid")}
          onChange={(e) =>
            setValue("is_paid", (e.target as HTMLInputElement).checked)
          }
        />

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            loading={
              isSubmitting || createEntry.isPending || updateEntry.isPending
            }
          >
            {isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
