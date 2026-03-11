"use client";

import { useCallStore } from "@/stores/call-store";
import { useCallNotifications } from "@/hooks/use-call-notifications";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { Phone, X } from "lucide-react";
import Link from "next/link";

export function IncomingCallToast() {
  const { incomingCallId, incomingCallerName } = useCallStore();
  const { dismissIncoming } = useCallNotifications();
  const prefix = useRoutePrefix();

  if (!incomingCallId || !incomingCallerName) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
      <div
        className="bg-surface rounded-2xl p-4 min-w-[280px]"
        style={{
          boxShadow: "0 8px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-start gap-3">
          {/* Animated call icon */}
          <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-green-500 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {incomingCallerName}
            </p>
            <p className="text-xs text-muted-foreground">Appel entrant...</p>

            <div className="flex items-center gap-2 mt-3">
              <Link
                href={`${prefix}/calls/${incomingCallId}`}
                onClick={() => dismissIncoming()}
                className="h-8 px-4 rounded-xl bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-all flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                Rejoindre
              </Link>
              <button
                onClick={() => dismissIncoming()}
                className="h-8 px-3 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
              >
                Ignorer
              </button>
            </div>
          </div>

          <button
            onClick={() => dismissIncoming()}
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
