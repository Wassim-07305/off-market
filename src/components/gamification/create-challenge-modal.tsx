"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trophy, Calendar, Zap } from "lucide-react";

interface CreateChallengeModalProps {
  open: boolean;
  onClose: () => void;
}

const CHALLENGE_TYPES = [
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
  { value: "community", label: "Communautaire" },
];

export function CreateChallengeModal({
  open,
  onClose,
}: CreateChallengeModalProps) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [challengeType, setChallengeType] = useState("weekly");
  const [xpReward, setXpReward] = useState("100");
  const [durationDays, setDurationDays] = useState("7");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setLoading(true);
    try {
      const startsAt = new Date();
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + Number(durationDays));

      const { error } = await supabase.from("challenges").insert({
        title: title.trim(),
        description: description.trim() || null,
        challenge_type: challengeType,
        xp_reward: Number(xpReward),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        is_active: true,
        created_by: user.id,
        condition: {},
      } as any);

      if (error) throw error;

      toast.success("Defi cree avec succes !");
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      resetForm();
      onClose();
    } catch (err) {
      toast.error("Erreur lors de la creation du defi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setChallengeType("weekly");
    setXpReward("100");
    setDurationDays("7");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Creer un defi"
      description="Lance un nouveau defi pour motiver la communaute"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titre du defi"
          placeholder="Ex: 30 jours de prospection"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          icon={<Trophy className="w-4 h-4" />}
        />

        <Textarea
          label="Description"
          placeholder="Decris l'objectif du defi, les regles et les criteres de reussite..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            options={CHALLENGE_TYPES}
            value={challengeType}
            onChange={setChallengeType}
          />

          <Input
            label="Duree (jours)"
            type="number"
            min="1"
            max="365"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        <Input
          label="Recompense XP"
          type="number"
          min="10"
          max="10000"
          step="10"
          value={xpReward}
          onChange={(e) => setXpReward(e.target.value)}
          icon={<Zap className="w-4 h-4" />}
        />

        {/* Preview */}
        <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Apercu
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {challengeType === "weekly"
                ? "📅"
                : challengeType === "monthly"
                  ? "🗓️"
                  : "🌍"}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                {title || "Titre du defi"}
              </p>
              <p className="text-xs text-muted-foreground">
                {durationDays} jours · +{xpReward} XP
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!title.trim()}
            icon={<Trophy className="w-4 h-4" />}
          >
            Creer le defi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
