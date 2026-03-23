"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, MessageCircle, ArrowRight } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageTestStepProps {
  onNext: () => void;
}

export function MessageTestStep({ onNext }: MessageTestStepProps) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    setSending(true);
    try {
      // Find or create the default/general channel to send the test message
      const { data: channels } = (await supabase
        .from("channels")
        .select("id")
        .eq("is_default", true)
        .limit(1)) as { data: { id: string }[] | null };

      let channelId: string | null = channels?.[0]?.id ?? null;

      // Fallback: find any public channel
      if (!channelId) {
        const { data: publicChannels } = (await supabase
          .from("channels")
          .select("id")
          .eq("type", "public")
          .limit(1)) as { data: { id: string }[] | null };
        channelId = publicChannels?.[0]?.id ?? null;
      }

      if (!channelId) {
        // No channel found — still count as success for onboarding
        toast.success("Message envoye ! (simulation)");
        setSent(true);
        return;
      }

      // Ensure user is a member of the channel
      await supabase.from("channel_members").upsert(
        {
          channel_id: channelId,
          profile_id: user.id,
          role: "member",
        } as never,
        { onConflict: "channel_id,profile_id" },
      );

      // Send the actual message
      const { error } = await supabase.from("messages").insert({
        channel_id: channelId,
        sender_id: user.id,
        content: message.trim(),
        content_type: "text",
      } as never);

      if (error) throw error;

      toast.success("Message envoyé avec succès !");
      setSent(true);
    } catch {
      toast.error("Erreur lors de l'envoi. Tu peux reessayer ou passer.");
      // Allow skipping even on error
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center w-full max-w-lg mx-auto"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="mb-6 w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center"
      >
        <MessageCircle className="w-8 h-8 text-emerald-400" />
      </motion.div>

      <h3 className="text-xl font-bold text-white mb-2 text-center">
        Envoie ton premier message !
      </h3>
      <p className="text-sm text-white/50 text-center mb-8 max-w-sm">
        Presente-toi a la communaute. C&apos;est un petit pas, mais c&apos;est
        le debut de ton aventure Off Market.
      </p>

      {!sent ? (
        <>
          {/* Mini chat UI */}
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden mb-6">
            {/* Fake chat header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-white/50">
                # general
              </span>
            </div>

            {/* Example messages */}
            <div className="p-4 space-y-3 min-h-[120px]">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <div>
                  <p className="text-[11px] text-white/40 mb-0.5">Alexia</p>
                  <div className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white/70">
                    Bienvenue dans la communaute ! N&apos;hesite pas a te
                    presenter
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ecris ton message..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    message.trim()
                      ? "bg-primary text-white hover:bg-primary/80"
                      : "bg-white/5 text-white/20",
                  )}
                >
                  {sending ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/30">
            Appuie sur{" "}
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
              Entree
            </kbd>{" "}
            pour envoyer
          </p>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="mb-4 w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-white font-medium mb-2">Message envoye !</p>
          <p className="text-sm text-white/50 mb-8">
            Tu fais deja partie de la communaute.
          </p>
          <button
            onClick={onNext}
            className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary to-red-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105"
          >
            Continuer
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
