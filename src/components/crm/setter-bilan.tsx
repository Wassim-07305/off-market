"use client";

import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MessageSquare,
  RefreshCw,
  Link2,
  PhoneCall,
  Plus,
  StickyNote,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SetterActivity } from "@/types/setter-crm";
import {
  useSetterActivities,
  useCreateSetterActivity,
  useSetterStats,
} from "@/hooks/use-setter-crm";

// ─── KPI Card ──────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg",
          color,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Bilan Component ──────────────────────────────────

export function SetterBilan() {
  const { activities } = useSetterActivities();
  const { stats } = useSetterStats();
  const createActivity = useCreateSetterActivity();

  // Form state
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dms, setDms] = useState(0);
  const [relances, setRelances] = useState(0);
  const [links, setLinks] = useState(0);
  const [calls, setCalls] = useState(0);
  const [notes, setNotes] = useState("");

  // Weekly stats (fallback if hook does not return them)
  const weeklyStats = useMemo(() => {
    if (stats) return stats;

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1, locale: fr });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1, locale: fr });

    const weekActivities = activities.filter((a) =>
      isWithinInterval(new Date(a.date), { start: weekStart, end: weekEnd }),
    );

    return {
      dms_week: weekActivities.reduce((s, a) => s + (a.dms_sent ?? 0), 0),
      relances_week: weekActivities.reduce((s, a) => s + (a.relances ?? 0), 0),
      links_week: weekActivities.reduce((s, a) => s + (a.links_sent ?? 0), 0),
      calls_week: weekActivities.reduce((s, a) => s + (a.calls_booked ?? 0), 0),
    };
  }, [stats, activities]);

  function handleSubmit() {
    if (!date) {
      toast.error("Selectionnez une date");
      return;
    }
    createActivity.mutate(
      {
        date,
        dms_sent: dms,
        relances,
        links_sent: links,
        calls_booked: calls,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success("Activite ajoutee");
          setDms(0);
          setRelances(0);
          setLinks(0);
          setCalls(0);
          setNotes("");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="DMs cette semaine"
          value={weeklyStats.dms_week}
          icon={MessageSquare}
          color="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Relances cette semaine"
          value={weeklyStats.relances_week}
          icon={RefreshCw}
          color="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Liens cette semaine"
          value={weeklyStats.links_week}
          icon={Link2}
          color="bg-violet-50 text-violet-600"
        />
        <KpiCard
          label="Calls cette semaine"
          value={weeklyStats.calls_week}
          icon={PhoneCall}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Add activity form */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Ajouter une activite
        </h3>
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            icon={<CalendarDays className="w-4 h-4" />}
            wrapperClassName="max-w-xs"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="DMs envoyes"
              type="number"
              min={0}
              value={String(dms)}
              onChange={(e) => setDms(Number(e.target.value) || 0)}
              icon={<MessageSquare className="w-4 h-4" />}
            />
            <Input
              label="Relances"
              type="number"
              min={0}
              value={String(relances)}
              onChange={(e) => setRelances(Number(e.target.value) || 0)}
              icon={<RefreshCw className="w-4 h-4" />}
            />
            <Input
              label="Liens envoyes"
              type="number"
              min={0}
              value={String(links)}
              onChange={(e) => setLinks(Number(e.target.value) || 0)}
              icon={<Link2 className="w-4 h-4" />}
            />
            <Input
              label="Calls bookes"
              type="number"
              min={0}
              value={String(calls)}
              onChange={(e) => setCalls(Number(e.target.value) || 0)}
              icon={<PhoneCall className="w-4 h-4" />}
            />
          </div>

          <Textarea
            label="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Commentaires sur la journee..."
            autoGrow
          />

          <Button
            onClick={handleSubmit}
            loading={createActivity.isPending}
            icon={<Plus className="w-4 h-4" />}
          >
            Ajouter
          </Button>
        </div>
      </div>

      {/* Activity history */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            Historique d'activite
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    DMs
                  </div>
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Relances
                  </div>
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Link2 className="w-3.5 h-3.5" />
                    Liens
                  </div>
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5" />
                    Calls
                  </div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/10 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {format(new Date(activity.date), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </td>
                  <td className="px-4 py-3 text-center text-foreground">
                    {activity.dms_sent ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center text-foreground">
                    {activity.relances ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center text-foreground">
                    {activity.links_sent ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center text-foreground">
                    {activity.calls_booked ?? 0}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                    {activity.notes || "—"}
                  </td>
                </tr>
              ))}

              {activities.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Aucune activite enregistree.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
