import { useState } from "react";
import {
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useAnnouncements,
  useDismissAnnouncement,
} from "@/hooks/useAnnouncements";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/types/database";

const typeConfig: Record<
  Announcement["type"],
  { icon: typeof Info; bg: string; border: string; text: string }
> = {
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
  },
  update: {
    icon: Sparkles,
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-800",
  },
  urgent: {
    icon: AlertTriangle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
  },
};

function AnnouncementItem({
  announcement,
  onDismiss,
}: {
  announcement: Announcement;
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[announcement.type];
  const Icon = config.icon;
  const isLong = announcement.content.length > 150;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cn("relative border-b px-4 py-3", config.bg, config.border)}
    >
      <div className="mx-auto flex max-w-[1400px] items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.text)} />

        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-semibold", config.text)}>
            {announcement.title}
          </p>
          <p
            className={cn(
              "mt-0.5 text-sm",
              config.text.replace("800", "700"),
              !expanded && isLong && "line-clamp-2",
            )}
          >
            {announcement.content}
          </p>

          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                config.text.replace("800", "600"),
                "hover:underline",
              )}
            >
              {expanded ? (
                <>
                  Voir moins <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Voir plus <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className={cn(
            "shrink-0 rounded-lg p-1.5 transition-colors",
            "hover:bg-black/5",
            config.text,
          )}
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function AnnouncementBanner() {
  const { data: announcements } = useAnnouncements();
  const dismiss = useDismissAnnouncement();

  if (!announcements || announcements.length === 0) return null;

  return (
    <AnimatePresence>
      {announcements.map((announcement) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
          onDismiss={() => dismiss.mutate(announcement.id)}
        />
      ))}
    </AnimatePresence>
  );
}
