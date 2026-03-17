"use client";

import { useState, useEffect } from "react";
import { useCoachAIConfig, useUpdateAIConfig } from "@/hooks/use-alexia";
import { Loader2, Save } from "lucide-react";

export function AlexiaConfigPanel() {
  const { data: config, isLoading } = useCoachAIConfig();
  const update = useUpdateAIConfig();

  const [aiName, setAiName] = useState("AlexIA");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (config) {
      setAiName(config.ai_name || "AlexIA");
      setInstructions(config.system_instructions || "");
      setTone(config.tone || "professionnel");
      setGreeting(config.greeting_message || "");
    }
  }, [config]);

  const handleSave = () => {
    update.mutate({
      ai_name: aiName,
      system_instructions: instructions,
      tone,
      greeting_message: greeting,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const inputClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground">
          Configuration d&apos;AlexIA
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personnalise le comportement et le ton de ton assistant IA.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
        {/* Tone */}
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Ton de l&apos;IA
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className={inputClass}
          >
            <option value="professionnel">Professionnel</option>
            <option value="amical">Amical</option>
            <option value="direct">Direct et concis</option>
            <option value="motivant">Motivant et energique</option>
            <option value="empathique">Empathique et bienveillant</option>
          </select>
        </div>

        {/* Greeting */}
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Message d&apos;accueil
          </label>
          <input
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="Bonjour ! Je suis AlexIA, l'assistante de ton coach..."
            className={inputClass}
          />
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Instructions personnalisees
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={6}
            placeholder={
              "Ex:\n- Tutoie toujours le client\n- Utilise des emojis\n- Sois direct et concis\n- Rappelle les objectifs du client a chaque echange"
            }
            className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Ces instructions seront ajoutees au prompt systeme d&apos;AlexIA
          </p>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
          >
            {update.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
