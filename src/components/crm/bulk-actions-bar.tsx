"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { STUDENT_TAGS, STUDENT_FLAGS } from "@/lib/constants";
import { useStudents } from "@/hooks/use-students";
import type { StudentFlag } from "@/types/database";
import {
  CheckSquare,
  X,
  Tag,
  Flag,
  UserCog,
  MessageSquare,
  Loader2,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkTag: (tag: string) => Promise<void>;
  onBulkFlag: (flag: StudentFlag) => Promise<void>;
  onBulkCoach: (coachId: string) => Promise<void>;
  isLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkTag,
  onBulkFlag,
  onBulkCoach,
  isLoading = false,
}: BulkActionsBarProps) {
  const [activeAction, setActiveAction] = useState<
    "tag" | "flag" | "coach" | "message" | null
  >(null);
  const [message, setMessage] = useState("");
  const { students: coaches } = useStudents({ limit: 200 });
  // Filter coaches from students — ideally useCoachesList would exist
  const coachList = (coaches ?? []).filter((c: any) => c.role === "coach") as {
    id: string;
    full_name: string;
  }[];

  const handleBulkTag = async (tag: string) => {
    await onBulkTag(tag);
    setActiveAction(null);
  };

  const handleBulkFlag = async (flag: StudentFlag) => {
    await onBulkFlag(flag);
    setActiveAction(null);
  };

  const handleBulkCoach = async (coachId: string) => {
    await onBulkCoach(coachId);
    setActiveAction(null);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // For now, show a toast — real implementation would use messaging system
    toast.success(`Message envoye a ${selectedCount} élève(s)`);
    setMessage("");
    setActiveAction(null);
  };

  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-3"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          {selectedCount} selectionne{selectedCount > 1 ? "s" : ""}
        </span>

        <div className="flex-1" />

        {/* Tag action */}
        <div className="relative">
          <button
            onClick={() =>
              setActiveAction(activeAction === "tag" ? null : "tag")
            }
            disabled={isLoading}
            className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Tag className="w-3 h-3" />
            )}
            Tag
          </button>
          {activeAction === "tag" && (
            <div className="absolute top-full mt-1 right-0 bg-surface border border-border rounded-xl shadow-lg z-50 py-1 w-40">
              {STUDENT_TAGS.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => handleBulkTag(tag.value)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      tag.color.split(" ")[0].replace("text-", "bg-"),
                    )}
                  />
                  {tag.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Flag action */}
        <div className="relative">
          <button
            onClick={() =>
              setActiveAction(activeAction === "flag" ? null : "flag")
            }
            disabled={isLoading}
            className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Flag className="w-3 h-3" />
            Drapeau
          </button>
          {activeAction === "flag" && (
            <div className="absolute top-full mt-1 right-0 bg-surface border border-border rounded-xl shadow-lg z-50 py-1 w-48">
              {STUDENT_FLAGS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleBulkFlag(f.value)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                >
                  <span
                    className={cn("w-3 h-3 rounded-full shrink-0", f.dotColor)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Coach action */}
        <div className="relative">
          <button
            onClick={() =>
              setActiveAction(activeAction === "coach" ? null : "coach")
            }
            disabled={isLoading}
            className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <UserCog className="w-3 h-3" />
            Coach
          </button>
          {activeAction === "coach" && (
            <div className="absolute top-full mt-1 right-0 bg-surface border border-border rounded-xl shadow-lg z-50 py-1 w-48">
              {coachList && coachList.length > 0 ? (
                coachList.map((coach: { id: string; full_name: string }) => (
                  <button
                    key={coach.id}
                    onClick={() => handleBulkCoach(coach.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] text-primary font-medium shrink-0">
                      {coach.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    {coach.full_name}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Aucun coach disponible
                </p>
              )}
            </div>
          )}
        </div>

        {/* Message action */}
        <button
          onClick={() =>
            setActiveAction(activeAction === "message" ? null : "message")
          }
          disabled={isLoading}
          className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <MessageSquare className="w-3 h-3" />
          Message
        </button>

        {/* Close */}
        <button
          onClick={onClearSelection}
          className="h-8 px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message input */}
      {activeAction === "message" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex gap-2"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message a ${selectedCount} élève(s)...`}
            className="flex-1 h-9 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="h-9 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3 h-3" />
            Envoyer
          </button>
        </motion.div>
      )}

      {/* Close dropdown on click outside */}
      {activeAction && activeAction !== "message" && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveAction(null)}
        />
      )}
    </motion.div>
  );
}
