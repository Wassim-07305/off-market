"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Briefcase,
  TrendingUp,
  Target,
  UserSearch,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const aboutYouSchema = z.object({
  business_type: z.string().min(1, "Selectionne ta niche"),
  current_revenue: z.string().min(1, "Indique ta tranche de revenus"),
  goals: z.string().min(3, "Decris tes objectifs"),
  how_found_alexia: z.string().min(1, "Dis-nous comment tu nous as trouve"),
});

export type AboutYouFormData = z.infer<typeof aboutYouSchema>;

const BUSINESS_TYPES = [
  { value: "dev-web", label: "Developpement web" },
  { value: "copywriting", label: "Copywriting" },
  { value: "marketing", label: "Marketing digital" },
  { value: "design", label: "Design / UI-UX" },
  { value: "coaching", label: "Coaching" },
  { value: "video", label: "Video / Montage" },
  { value: "ads", label: "Media buying / Ads" },
  { value: "seo", label: "SEO / Redaction" },
  { value: "community", label: "Community management" },
  { value: "other", label: "Autre" },
];

const REVENUE_RANGES = [
  { value: "0-1k", label: "0 - 1 000 EUR/mois" },
  { value: "1k-3k", label: "1 000 - 3 000 EUR/mois" },
  { value: "3k-5k", label: "3 000 - 5 000 EUR/mois" },
  { value: "5k-10k", label: "5 000 - 10 000 EUR/mois" },
];

const SOURCES = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "prospection", label: "Prospection" },
  { value: "referral", label: "Recommendation" },
  { value: "google", label: "Google" },
  { value: "other", label: "Autre" },
];

interface AboutYouStepProps {
  onSubmit: (data: AboutYouFormData) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<AboutYouFormData>;
}

export function AboutYouStep({
  onSubmit,
  isSubmitting,
  defaultValues,
}: AboutYouStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AboutYouFormData>({
    resolver: zodResolver(aboutYouSchema),
    defaultValues: {
      business_type: "",
      current_revenue: "",
      goals: "",
      how_found_alexia: "",
      ...defaultValues,
    },
  });

  const selectedBusiness = watch("business_type");
  const selectedRevenue = watch("current_revenue");
  const selectedSource = watch("how_found_alexia");

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* Business type */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
          <Briefcase className="w-4 h-4 text-primary" />
          Quelle est ta niche ?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setValue("business_type", type.value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                selectedBusiness === type.value
                  ? "border-primary bg-primary/20 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10",
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("business_type")} />
        {errors.business_type && (
          <p className="mt-1.5 text-xs text-red-400">
            {errors.business_type.message}
          </p>
        )}
      </div>

      {/* Revenue */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          Tes revenus actuels
        </label>
        <div className="space-y-2">
          {REVENUE_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setValue("current_revenue", range.value)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                selectedRevenue === range.value
                  ? "border-primary bg-primary/20 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("current_revenue")} />
        {errors.current_revenue && (
          <p className="mt-1.5 text-xs text-red-400">
            {errors.current_revenue.message}
          </p>
        )}
      </div>

      {/* Goals */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
          <Target className="w-4 h-4 text-primary" />
          Quels sont tes objectifs avec Off Market ?
        </label>
        <textarea
          {...register("goals")}
          rows={3}
          placeholder="Ex: Atteindre 15k/mois en 6 mois, structurer mon business, deleguer..."
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-primary"
        />
        {errors.goals && (
          <p className="mt-1.5 text-xs text-red-400">{errors.goals.message}</p>
        )}
      </div>

      {/* How found */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
          <UserSearch className="w-4 h-4 text-primary" />
          Comment as-tu decouvert Alexia ?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SOURCES.map((source) => (
            <button
              key={source.value}
              type="button"
              onClick={() => setValue("how_found_alexia", source.value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                selectedSource === source.value
                  ? "border-primary bg-primary/20 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10",
              )}
            >
              {source.label}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("how_found_alexia")} />
        {errors.how_found_alexia && (
          <p className="mt-1.5 text-xs text-red-400">
            {errors.how_found_alexia.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary to-red-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            Continuer
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </motion.form>
  );
}
