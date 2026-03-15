"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  useCreateFaqEntry,
  useUpdateFaqEntry,
  useFaqEntry,
} from "@/hooks/use-faq";

const faqEntrySchema = z.object({
  question: z
    .string()
    .min(5, "La question doit contenir au moins 5 caracteres"),
  answer: z.string().min(1, "La reponse est requise"),
  category: z.string().min(1, "La categorie est requise"),
  auto_answer_enabled: z.boolean(),
});

type FaqEntryFormData = z.infer<typeof faqEntrySchema>;

const FAQ_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "onboarding", label: "Onboarding" },
  { value: "facturation", label: "Facturation" },
  { value: "formation", label: "Formation" },
  { value: "coaching", label: "Coaching" },
  { value: "technique", label: "Technique" },
  { value: "communaute", label: "Communaute" },
  { value: "autre", label: "Autre" },
];

interface FaqEntryModalProps {
  open: boolean;
  onClose: () => void;
  entryId?: string | null;
}

export function FaqEntryModal({ open, onClose, entryId }: FaqEntryModalProps) {
  const isEdit = !!entryId;
  const { data: entry } = useFaqEntry(entryId ?? null);
  const createEntry = useCreateFaqEntry();
  const updateEntry = useUpdateFaqEntry();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FaqEntryFormData>({
    resolver: zodResolver(faqEntrySchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "general",
      auto_answer_enabled: false,
    },
  });

  const autoAnswer = watch("auto_answer_enabled");
  const category = watch("category");

  useEffect(() => {
    if (entry && isEdit) {
      reset({
        question: entry.question,
        answer: entry.answer,
        category: entry.category,
        auto_answer_enabled: entry.auto_answer_enabled,
      });
    } else if (!isEdit) {
      reset({
        question: "",
        answer: "",
        category: "general",
        auto_answer_enabled: false,
      });
    }
  }, [entry, isEdit, reset]);

  const onSubmit = async (data: FaqEntryFormData) => {
    try {
      if (isEdit && entryId) {
        await updateEntry.mutateAsync({
          id: entryId,
          ...data,
        });
      } else {
        await createEntry.mutateAsync(data);
      }
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  const isPending = createEntry.isPending || updateEntry.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier la question FAQ" : "Nouvelle question FAQ"}
      description={
        isEdit
          ? "Modifiez la question et sa reponse"
          : "Ajoutez une nouvelle question a la base de connaissances"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Question"
          placeholder="Ex: Comment acceder a la formation ?"
          error={errors.question?.message}
          {...register("question")}
        />

        <Textarea
          label="Reponse"
          placeholder="Ecrivez la reponse detaillee..."
          error={errors.answer?.message}
          autoGrow
          className="min-h-[120px]"
          {...register("answer")}
        />

        <Select
          label="Categorie"
          options={FAQ_CATEGORIES}
          value={category}
          onChange={(val) => setValue("category", val)}
          error={errors.category?.message}
        />

        <Switch
          label="Reponse automatique"
          description="L'IA enverra automatiquement cette reponse quand la question est detectee"
          checked={autoAnswer}
          onCheckedChange={(checked) =>
            setValue("auto_answer_enabled", checked)
          }
          wrapperClassName="w-full"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button type="submit" loading={isPending}>
            {isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
