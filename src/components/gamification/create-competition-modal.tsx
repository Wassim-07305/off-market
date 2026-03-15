"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useCreateCompetition } from "@/hooks/use-competitions";
import {
  Trophy,
  Loader2,
  Zap,
  Phone,
  UserPlus,
  Euro,
  Users,
  Swords,
  Calendar,
  Clock,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COMPETITION_STATUS_CONFIG,
  COMPETITION_METRIC_CONFIG,
  type CompetitionType,
  type CompetitionMetric,
} from "@/types/gamification";

const competitionSchema = z
  .object({
    title: z.string().min(3, "Le titre doit faire au moins 3 caracteres"),
    description: z.string().optional(),
    type: z.enum(["team_vs_team", "free_for_all"]),
    metric: z.enum(["xp", "calls", "clients", "revenue"]),
    start_date: z.string().min(1, "Date de debut requise"),
    end_date: z.string().min(1, "Date de fin requise"),
    prize_description: z.string().optional(),
  })
  .refine(
    (data) => new Date(data.end_date) > new Date(data.start_date),
    {
      message: "La date de fin doit etre apres la date de debut",
      path: ["end_date"],
    },
  );

type CompetitionFormValues = z.infer<typeof competitionSchema>;

const TYPE_OPTIONS: { value: CompetitionType; label: string; icon: typeof Users }[] = [
  { value: "team_vs_team", label: "Equipe vs Equipe", icon: Users },
  { value: "free_for_all", label: "Tous contre tous", icon: Swords },
];

const METRIC_OPTIONS: {
  value: CompetitionMetric;
  label: string;
  icon: typeof Zap;
}[] = [
  { value: "xp", label: "XP", icon: Zap },
  { value: "calls", label: "Appels", icon: Phone },
  { value: "clients", label: "Clients", icon: UserPlus },
  { value: "revenue", label: "Chiffre d'affaires", icon: Euro },
];

interface CreateCompetitionModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCompetitionModal({
  open,
  onClose,
}: CreateCompetitionModalProps) {
  const createCompetition = useCreateCompetition();
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      type: "team_vs_team",
      metric: "xp",
    },
  });

  const watchedValues = watch();

  const onSubmit = async (values: CompetitionFormValues) => {
    await createCompetition.mutateAsync({
      title: values.title,
      description: values.description,
      type: values.type,
      metric: values.metric,
      start_date: new Date(values.start_date).toISOString(),
      end_date: new Date(values.end_date).toISOString(),
      prize_description: values.prize_description,
    });
    reset();
    onClose();
  };

  const selectedMetricConfig = COMPETITION_METRIC_CONFIG[watchedValues.metric ?? "xp"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle competition"
      description="Creez une competition pour engager vos equipes"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Titre de la competition *
          </label>
          <input
            {...register("title")}
            placeholder="Ex : Sprint du mois de mars"
            className={cn(
              "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]",
              errors.title && "border-red-500",
            )}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="Decrivez l'objectif de la competition..."
            className={cn(
              "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm resize-none",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]",
            )}
          />
        </div>

        {/* Type selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type de competition *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = watchedValues.type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("type", opt.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                    selected
                      ? "border-[#DC2626] bg-[#DC2626]/5 text-[#DC2626]"
                      : "border-border text-muted-foreground hover:border-foreground/20",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Metric selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Metrique *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {METRIC_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = watchedValues.metric === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("metric", opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    selected
                      ? "border-[#DC2626] bg-[#DC2626]/5 text-[#DC2626]"
                      : "border-border text-muted-foreground hover:border-foreground/20",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              Date de debut *
            </label>
            <input
              type="datetime-local"
              {...register("start_date")}
              className={cn(
                "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]",
                errors.start_date && "border-red-500",
              )}
            />
            {errors.start_date && (
              <p className="text-xs text-red-500 mt-1">
                {errors.start_date.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              Date de fin *
            </label>
            <input
              type="datetime-local"
              {...register("end_date")}
              className={cn(
                "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]",
                errors.end_date && "border-red-500",
              )}
            />
            {errors.end_date && (
              <p className="text-xs text-red-500 mt-1">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Prize */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            <Gift className="w-3.5 h-3.5 inline mr-1" />
            Recompense
          </label>
          <input
            {...register("prize_description")}
            placeholder="Ex : Session coaching offerte pour l'equipe gagnante"
            className={cn(
              "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]",
            )}
          />
        </div>

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-[#DC2626] font-medium hover:underline cursor-pointer"
        >
          {showPreview ? "Masquer l'apercu" : "Voir l'apercu"}
        </button>

        {/* Preview */}
        {showPreview && watchedValues.title && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#DC2626]" />
              <span className="text-sm font-semibold text-foreground">
                {watchedValues.title}
              </span>
            </div>
            {watchedValues.description && (
              <p className="text-xs text-muted-foreground">
                {watchedValues.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-500/10 text-blue-600 text-[10px]">
                A venir
              </Badge>
              <Badge className="bg-muted text-muted-foreground text-[10px]">
                {selectedMetricConfig?.label}
              </Badge>
              <Badge className="bg-muted text-muted-foreground text-[10px]">
                {watchedValues.type === "team_vs_team"
                  ? "Equipes"
                  : "Individuel"}
              </Badge>
            </div>
            {watchedValues.prize_description && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700">
                <Trophy className="w-3 h-3" />
                {watchedValues.prize_description}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={createCompetition.isPending}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all cursor-pointer",
              "bg-[#DC2626] hover:bg-[#DC2626]/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {createCompetition.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trophy className="w-4 h-4" />
            )}
            Creer la competition
          </button>
        </div>
      </form>
    </Modal>
  );
}
