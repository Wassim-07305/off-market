"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCommunity } from "@/hooks/use-communities";
import { cn } from "@/lib/utils";
import { Users, Lock, Globe, Eye } from "lucide-react";

const createCommunitySchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit faire au moins 2 caracteres")
    .max(60, "Le nom ne peut pas depasser 60 caracteres"),
  description: z
    .string()
    .max(300, "La description ne peut pas depasser 300 caracteres")
    .optional(),
  slug: z
    .string()
    .min(2, "Le slug doit faire au moins 2 caracteres")
    .max(40, "Le slug ne peut pas depasser 40 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets",
    ),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur hexadecimale invalide"),
  is_private: z.boolean(),
  max_members: z.number().int().positive().nullable(),
});

type CreateCommunityForm = z.infer<typeof createCommunitySchema>;

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

const PRESET_ICONS = [
  "💬",
  "🎯",
  "💡",
  "🔥",
  "📈",
  "🤝",
  "💰",
  "🏆",
  "📚",
  "🎓",
  "⚡",
  "🌟",
  "🛠️",
  "📣",
  "🧠",
  "❤️",
];

interface CreateCommunityModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCommunityModal({
  open,
  onClose,
}: CreateCommunityModalProps) {
  const createCommunity = useCreateCommunity();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCommunityForm>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      icon: "💬",
      color: "#ef4444",
      is_private: false,
      max_members: null,
    },
  });

  const name = watch("name");
  const icon = watch("icon");
  const color = watch("color");
  const isPrivate = watch("is_private");
  const description = watch("description");

  // Auto-generate slug from name
  useEffect(() => {
    if (name) {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [name, setValue]);

  const onSubmit = (data: CreateCommunityForm) => {
    createCommunity.mutate(
      {
        name: data.name,
        description: data.description || undefined,
        slug: data.slug,
        icon: data.icon || undefined,
        color: data.color,
        is_private: data.is_private,
        max_members: data.max_members,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Creer un groupe"
      description="Creez un espace thematique pour votre communaute"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Preview card */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div
            className="h-14 flex items-center justify-center"
            style={{ backgroundColor: color + "18" }}
          >
            <span className="text-2xl">{icon || "💬"}</span>
          </div>
          <div className="p-3">
            <p className="text-sm font-semibold text-foreground truncate">
              {name || "Nom du groupe"}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> 0 membres
              </span>
              {isPrivate && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Prive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <Input
          label="Nom du groupe"
          placeholder="Ex: Strategies LinkedIn"
          error={errors.name?.message}
          {...register("name")}
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            placeholder="Decrivez le theme et l'objectif de ce groupe..."
            rows={3}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Slug */}
        <Input
          label="Slug (URL)"
          placeholder="strategies-linkedin"
          error={errors.slug?.message}
          {...register("slug")}
        />

        {/* Icon picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Icone</label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setValue("icon", emoji)}
                className={cn(
                  "w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all hover:scale-105",
                  icon === emoji
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-border/80",
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Couleur</label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue("color", c)}
                className={cn(
                  "w-8 h-8 rounded-full transition-all hover:scale-110",
                  color === c && "ring-2 ring-offset-2 ring-primary",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setValue("color", e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer border-0 p-0"
            />
          </div>
        </div>

        {/* Privacy toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            {isPrivate ? (
              <Lock className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {isPrivate ? "Groupe prive" : "Groupe public"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPrivate
                  ? "Seuls les membres invites peuvent voir et rejoindre"
                  : "Visible et accessible a tous les utilisateurs"}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPrivate}
            onClick={() => setValue("is_private", !isPrivate)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              isPrivate ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-surface shadow-lg ring-0 transition-transform",
                isPrivate ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        {/* Max members */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Nombre max de membres (optionnel)
          </label>
          <input
            type="number"
            min={2}
            placeholder="Illimite"
            className="w-full h-10 px-3.5 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              setValue("max_members", val);
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            loading={createCommunity.isPending}
            className="flex-1"
          >
            Creer le groupe
          </Button>
        </div>
      </form>
    </Modal>
  );
}
