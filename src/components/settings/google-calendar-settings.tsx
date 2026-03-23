"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Calendar, Loader2, Unlink, ExternalLink } from "lucide-react";
import {
  useGoogleCalendarStatus,
  useDisconnectGoogleCalendar,
} from "@/hooks/use-google-calendar";
import { Button } from "@/components/ui/button";

export function GoogleCalendarSettings() {
  const googleStatus = useGoogleCalendarStatus();
  const disconnectGoogle = useDisconnectGoogleCalendar();

  // Toast on Google Calendar OAuth callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleParam = params.get("google");
    if (googleParam === "success") {
      toast.success("Google Agenda connecte avec succès");
      window.history.replaceState({}, "", window.location.pathname);
      googleStatus.refetch();
    } else if (googleParam === "error") {
      toast.error("Erreur lors de la connexion a Google Agenda");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div
      className="bg-surface rounded-2xl p-6 space-y-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Google Agenda</h2>
      </div>

      {googleStatus.data?.connected ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Connecte</p>
              <p className="text-xs text-muted-foreground">
                {googleStatus.data.google_email}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => disconnectGoogle.mutate()}
            loading={disconnectGoogle.isPending}
            icon={
              disconnectGoogle.isPending ? undefined : (
                <Unlink className="w-3.5 h-3.5" />
              )
            }
          >
            Deconnecter
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Connecte ton agenda Google pour voir tes événements dans la page
            Appels.
          </p>
          <a
            href="/api/google-calendar/connect"
            className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2 shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Connecter
          </a>
        </div>
      )}
    </div>
  );
}
