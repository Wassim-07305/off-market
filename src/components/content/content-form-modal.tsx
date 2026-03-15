"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import {
  useCreateContent,
  useUpdateContent,
  type SocialContentItem,
  type ContentPlatform,
  type ContentStatus,
} from "@/hooks/use-social-content";
import { cn } from "@/lib/utils";
import {
  Instagram,
  Linkedin,
  Music2,
  X,
  Loader2,
  Hash,
  Image,
  StickyNote,
} from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────

const contentFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200),
  caption: z.string().max(3000).optional(),
  platform: z.enum(["instagram", "linkedin", "tiktok"]),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  scheduled_at: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().max(2000).optional(),
  media_url: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

// ─── Character limits by platform ────────────────────────────

const CAPTION_LIMITS: Record<ContentPlatform, number> = {
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
};

const PLATFORM_OPTIONS: {
  value: ContentPlatform;
  label: string;
  icon: typeof Instagram;
  color: string;
}[] = [
  {
    value: "instagram",
    label: "Instagram",
    icon: Instagram,
    color:
      "text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color:
      "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: Music2,
    color:
      "text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600",
  },
];

const STATUS_OPTIONS: { value: ContentStatus; label: string; dot: string }[] = [
  { value: "draft", label: "Brouillon", dot: "bg-zinc-400" },
  { value: "scheduled", label: "Planifie", dot: "bg-blue-500" },
  { value: "published", label: "Publie", dot: "bg-emerald-500" },
  { value: "archived", label: "Archive", dot: "bg-zinc-300" },
];

// ─── Modal Component ─────────────────────────────────────────

interface ContentFormModalProps {
  open: boolean;
  onClose: () => void;
  editItem?: SocialContentItem | null;
  defaultScheduledAt?: string;
}

export function ContentFormModal({
  open,
  onClose,
  editItem,
  defaultScheduledAt,
}: ContentFormModalProps) {
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const isEdit = !!editItem;
  const isPending = createContent.isPending || updateContent.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: "",
      caption: "",
      platform: "instagram",
      status: "draft",
      scheduled_at: "",
      tags: "",
      notes: "",
      media_url: "",
    },
  });

  const platform = watch("platform");
  const caption = watch("caption") ?? "";
  const captionLimit = CAPTION_LIMITS[platform as ContentPlatform] ?? 2200;

  // Tags state for pill display
  const [tagsList, setTagsList] = useState<string[]>([]);

  // Reset form when modal opens/closes or editItem changes
  useEffect(() => {
    if (open) {
      if (editItem) {
        reset({
          title: editItem.title,
          caption: editItem.caption ?? "",
          platform: editItem.platform,
          status: editItem.status,
          scheduled_at: editItem.scheduled_at
            ? editItem.scheduled_at.slice(0, 16)
            : "",
          tags: editItem.tags?.join(", ") ?? "",
          notes: editItem.notes ?? "",
          media_url: editItem.media_urls?.[0] ?? "",
        });
        setTagsList(editItem.tags ?? []);
      } else {
        reset({
          title: "",
          caption: "",
          platform: "instagram",
          status: defaultScheduledAt ? "scheduled" : "draft",
          scheduled_at: defaultScheduledAt
            ? defaultScheduledAt.slice(0, 16)
            : "",
          tags: "",
          notes: "",
          media_url: "",
        });
        setTagsList([]);
      }
    }
  }, [open, editItem, defaultScheduledAt, reset]);

  const handleTagsChange = (value: string) => {
    setValue("tags", value);
    const parsed = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setTagsList(parsed);
  };

  const removeTag = (tag: string) => {
    const newTags = tagsList.filter((t) => t !== tag);
    setTagsList(newTags);
    setValue("tags", newTags.join(", "));
  };

  const onSubmit = (values: ContentFormValues) => {
    const tags = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const media_urls = values.media_url?.trim()
      ? [values.media_url.trim()]
      : [];

    if (isEdit && editItem) {
      updateContent.mutate(
        {
          id: editItem.id,
          title: values.title,
          caption: values.caption || undefined,
          platform: values.platform as ContentPlatform,
          status: values.status as ContentStatus,
          scheduled_at: values.scheduled_at || null,
          tags,
          notes: values.notes || undefined,
          media_urls,
        },
        { onSuccess: () => onClose() },
      );
    } else {
      createContent.mutate(
        {
          title: values.title,
          caption: values.caption || undefined,
          platform: values.platform as ContentPlatform,
          status: values.status as ContentStatus,
          scheduled_at: values.scheduled_at || undefined,
          tags,
          notes: values.notes || undefined,
          media_urls,
        },
        { onSuccess: () => onClose() },
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier le contenu" : "Nouveau contenu"}
      description={
        isEdit
          ? "Modifier les informations du contenu"
          : "Creer un nouveau contenu pour vos reseaux sociaux"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Titre *
          </label>
          <input
            {...register("title")}
            placeholder="Titre du contenu"
            autoFocus
            className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Platform selector */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Plateforme
          </label>
          <div className="flex gap-2">
            {PLATFORM_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = platform === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("platform", opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all",
                    isSelected
                      ? opt.color
                      : "bg-surface border-border text-muted-foreground hover:text-foreground hover:border-zinc-300",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Legende
          </label>
          <textarea
            {...register("caption")}
            placeholder="Votre texte de publication..."
            rows={4}
            className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all resize-none"
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] text-muted-foreground">
              {caption.length} / {captionLimit} caracteres
            </p>
            {caption.length > captionLimit && (
              <p className="text-[11px] text-red-500 font-medium">
                Limite depassee
              </p>
            )}
          </div>
        </div>

        {/* Status + Schedule */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Statut
            </label>
            <select
              {...register("status")}
              className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all appearance-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Date de publication
            </label>
            <input
              type="datetime-local"
              {...register("scheduled_at")}
              className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
            <Hash className="w-3 h-3" />
            Tags
          </label>
          <input
            value={watch("tags")}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="marketing, lancement, promo (separes par des virgules)"
            className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
          />
          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tagsList.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground border border-border"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media URL */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
            <Image className="w-3 h-3" />
            URL media
          </label>
          <input
            {...register("media_url")}
            placeholder="https://..."
            type="url"
            className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
            <StickyNote className="w-3 h-3" />
            Notes internes
          </label>
          <textarea
            {...register("notes")}
            placeholder="Notes privees, idees, feedback..."
            rows={2}
            className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "h-10 px-5 text-sm font-semibold rounded-xl transition-all",
              "bg-foreground text-background hover:opacity-90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2",
            )}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEdit ? "Enregistrer" : "Creer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
