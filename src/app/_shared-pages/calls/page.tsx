"use client";

import { useState, useMemo, useEffect } from "react";
import { useCalls } from "@/hooks/use-calls";
import { CallFormModal } from "@/components/calls/call-form-modal";
import type { CallCalendarWithRelations } from "@/types/calls";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useSupabase } from "@/hooks/use-supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Plus,
  Radio,
  Search,
  Video,
  ChevronRight,
  Loader2,
  Users,
  Zap,
  Copy,
  Check,
  ExternalLink,
  X,
} from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { format, parseISO, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

/* ─── Onglet actif ─── */
type Tab = "calls" | "lives";

/* ─── Filtre statut ─── */
type StatusFilter = "all" | "planifie" | "realise" | "annule";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "planifie", label: "Planifies" },
  { value: "realise", label: "Realises" },
  { value: "annule", label: "Annules" },
];

/* ─── Status badge config ─── */
const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  planifie: {
    label: "Planifie",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  realise: {
    label: "Realise",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  no_show: {
    label: "No-show",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  annule: {
    label: "Annule",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  reporte: {
    label: "Reporte",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
};

/* ─── Live form modal ─── */
function LiveFormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { createCall } = useCalls();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      setDate(todayStr);
      const nextHour = new Date(Date.now() + 3600_000);
      nextHour.setMinutes(0);
      setTime(`${String(nextHour.getHours()).padStart(2, "0")}:00`);
      setDuration(60);
      setDescription("");
    }
  }, [open]);

  const today = new Date().toISOString().split("T")[0];

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    // Vérifier que la date/heure n'est pas dans le passé
    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime < new Date()) {
      toast.error("La date et l'heure doivent etre dans le futur");
      return;
    }

    setSaving(true);
    try {
      await createCall.mutateAsync({
        title,
        client_id: null,
        date,
        time,
        duration_minutes: duration,
        call_type: "live",
        status: "planifie",
        notes: description || undefined,
      });
      toast.success("Live cree");
      onClose();
    } catch {
      toast.error("Erreur lors de la creation du live");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const selectClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const labelClass =
    "block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface rounded-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50 sticky top-0 bg-surface rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
              <Radio className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-display font-semibold text-foreground">
              Nouveau live
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span className="sr-only">Fermer</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Titre *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Session Q&A Mars"
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Heure *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Duree</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={selectClass}
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1h</option>
              <option value={90}>1h30</option>
              <option value={120}>2h</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description du live (optionnel)..."
              className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            />
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Tous les clients seront automatiquement invites
          </p>

          <div className="flex gap-3 pt-2">
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={
                saving ||
                (date && time
                  ? new Date(`${date}T${time}`) < new Date()
                  : false)
              }
              className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Creer le live
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Simplified call form modal ─── */
function SimpleCallFormModal({
  open,
  onClose,
  editCall,
}: {
  open: boolean;
  onClose: () => void;
  editCall?: CallCalendarWithRelations | null;
}) {
  const { createCall, updateCall } = useCalls();
  const supabase = useSupabase();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>(
    [],
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "client" as any)
      .order("full_name")
      .then(({ data }) => setClients((data as any) ?? []));
  }, [open, supabase]);

  useEffect(() => {
    if (editCall) {
      setTitle(editCall.title);
      setClientId(editCall.client_id ?? "");
      setDate(editCall.date);
      setTime(editCall.time?.slice(0, 5) ?? "09:00");
      setDuration(editCall.duration_minutes);
    } else {
      setTitle("");
      setClientId("");
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      setDate(todayStr);
      const nextHour = new Date(Date.now() + 3600_000);
      nextHour.setMinutes(0);
      setTime(`${String(nextHour.getHours()).padStart(2, "0")}:00`);
      setDuration(30);
    }
  }, [editCall, open]);

  const today = new Date().toISOString().split("T")[0];

  if (!open) return null;

  const selectedClient = clients.find((c) => c.id === clientId);
  const resolvedTitle =
    title.trim() ||
    (selectedClient ? `Appel avec ${selectedClient.full_name}` : "Appel");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    // Vérifier que la date/heure n'est pas dans le passé
    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime < new Date()) {
      toast.error("La date et l'heure doivent etre dans le futur");
      return;
    }

    setSaving(true);
    try {
      if (editCall) {
        await updateCall.mutateAsync({
          id: editCall.id,
          title: resolvedTitle,
          client_id: clientId || null,
          date,
          time,
          duration_minutes: duration,
          call_type: "one_on_one",
        } as any);
        toast.success("Appel modifie");
      } else {
        await createCall.mutateAsync({
          title: resolvedTitle,
          client_id: clientId || undefined,
          date,
          time,
          duration_minutes: duration,
          call_type: "one_on_one",
          status: "planifie",
        });
        toast.success("Appel créé");
      }
      onClose();
    } catch {
      toast.error("Erreur");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const selectClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const labelClass =
    "block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface rounded-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50 sticky top-0 bg-surface rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-display font-semibold text-foreground">
              {editCall ? "Modifier l'appel" : "Nouvel appel"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span className="sr-only">Fermer</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                selectedClient
                  ? `Appel avec ${selectedClient.full_name}`
                  : "Auto-genere si vide"
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={selectClass}
            >
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Heure *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Duree</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={selectClass}
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1h</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={
                saving ||
                (!editCall && date && time
                  ? new Date(`${date}T${time}`) < new Date()
                  : false)
              }
              className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editCall ? "Modifier" : "Creer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Page principale : Appels & Lives
   ═══════════════════════════════════════════════════════════ */

export default function CallsPage() {
  const [tab, setTab] = useState<Tab>("calls");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [showCallForm, setShowCallForm] = useState(false);
  const [showLiveForm, setShowLiveForm] = useState(false);
  const [editCall, setEditCall] = useState<CallCalendarWithRelations | null>(
    null,
  );
  // Legacy modal for editing old call types
  const [showLegacyForm, setShowLegacyForm] = useState(false);
  const [instantCallLink, setInstantCallLink] = useState<string | null>(null);
  const [instantCallId, setInstantCallId] = useState<string | null>(null);

  const prefix = useRoutePrefix();
  const { calls, isLoading, error: callsError, createCall } = useCalls();

  /* ─── Filtrage ─── */
  const filteredCalls = useMemo(() => {
    let result = calls;

    // Filtre par onglet
    if (tab === "lives") {
      result = result.filter((c) => c.call_type === "live");
    } else {
      result = result.filter((c) => c.call_type !== "live");
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Recherche texte
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.client?.full_name?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [calls, tab, statusFilter, search]);

  /* ─── Helpers ─── */
  const isJoinable = (call: CallCalendarWithRelations) => {
    if (call.status === "annule") return false;
    if (call.status === "realise") return false;
    try {
      return isToday(parseISO(call.date));
    } catch {
      return false;
    }
  };

  const formatCallDate = (dateStr: string, timeStr: string) => {
    try {
      const d = parseISO(dateStr);
      const formatted = format(d, "d MMMM yyyy", { locale: fr });
      return `${formatted}, ${timeStr.slice(0, 5)}`;
    } catch {
      return `${dateStr} ${timeStr.slice(0, 5)}`;
    }
  };

  const handleCallClick = (call: CallCalendarWithRelations) => {
    if (call.call_type === "live" || call.call_type === "one_on_one") {
      // For new types, just open the legacy form for editing (which has full edit capabilities)
      setEditCall(call);
      setShowLegacyForm(true);
    } else {
      // Legacy call types — use legacy modal
      setEditCall(call);
      setShowLegacyForm(true);
    }
  };

  const router = useRouter();

  const handleNewCall = () => {
    setEditCall(null);
    setShowCallForm(true);
  };

  const handleNewLive = () => {
    setShowLiveForm(true);
  };

  const handleInstantCall = async () => {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().slice(0, 5);
    try {
      const call = (await createCall.mutateAsync({
        title: `Appel instantane — ${now.toLocaleDateString("fr-FR")}`,
        date,
        time,
        duration_minutes: 60,
        call_type: "one_on_one",
        status: "planifie",
      })) as any;
      if (call?.id) {
        const link = `${window.location.origin}${prefix}/calls/${call.id}`;
        setInstantCallId(call.id);
        setInstantCallLink(link);
      }
    } catch {
      toast.error("Erreur lors de la creation de l'appel");
    }
  };

  const totalCalls = calls.filter((c) => c.call_type !== "live").length;
  const totalLives = calls.filter((c) => c.call_type === "live").length;

  return (
    <motion.div
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Appels & Lives
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {totalCalls} appel{totalCalls !== 1 ? "s" : ""} · {totalLives} live
            {totalLives !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Bouton + Nouvel appel (dropdown) */}
        <DropdownMenu
          align="right"
          trigger={
            <button className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#AF0000]/20 transition-all duration-300 active:scale-[0.98] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvel appel
            </button>
          }
        >
          <DropdownMenuItem
            icon={<Zap className="w-4 h-4" />}
            onClick={handleInstantCall}
          >
            Appel instantane
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={<Phone className="w-4 h-4" />}
            onClick={handleNewCall}
          >
            Planifier un appel
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={<Radio className="w-4 h-4" />}
            onClick={handleNewLive}
          >
            Nouveau live
          </DropdownMenuItem>
        </DropdownMenu>
      </motion.div>

      {/* Onglets + Filtres */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        {/* Onglets */}
        <div className="flex rounded-xl overflow-hidden border border-border">
          <button
            onClick={() => {
              setTab("calls");
              setStatusFilter("all");
              setSearch("");
            }}
            className={cn(
              "h-9 px-4 flex items-center gap-1.5 text-sm font-medium transition-all duration-200",
              tab === "calls"
                ? "bg-[#AF0000] text-white"
                : "bg-surface text-muted-foreground hover:text-foreground hover:bg-zinc-50",
            )}
          >
            <Phone className="w-3.5 h-3.5" />
            Appels
            <span
              className={cn(
                "ml-1 text-xs px-1.5 py-0.5 rounded-full",
                tab === "calls"
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {totalCalls}
            </span>
          </button>
          <button
            onClick={() => {
              setTab("lives");
              setStatusFilter("all");
              setSearch("");
            }}
            className={cn(
              "h-9 px-4 flex items-center gap-1.5 text-sm font-medium transition-all duration-200 border-l border-border",
              tab === "lives"
                ? "bg-[#AF0000] text-white"
                : "bg-surface text-muted-foreground hover:text-foreground hover:bg-zinc-50",
            )}
          >
            <Radio className="w-3.5 h-3.5" />
            Lives
            <span
              className={cn(
                "ml-1 text-xs px-1.5 py-0.5 rounded-full",
                tab === "lives"
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {totalLives}
            </span>
          </button>
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="h-9 pl-9 pr-4 w-full sm:w-64 rounded-xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border transition-shadow"
          />
        </div>
      </motion.div>

      {/* Filtres statut */}
      <motion.div variants={staggerItem} className="flex items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200",
              statusFilter === f.value
                ? "bg-foreground text-background"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border",
            )}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Liste */}
      <motion.div variants={staggerItem}>
        <div
          className="bg-surface border border-border rounded-2xl divide-y divide-border/50 overflow-hidden"
          style={{
            boxShadow:
              "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.02)",
          }}
        >
          {callsError ? (
            <div className="p-12 text-center">
              <Phone className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Impossible de charger les appels. Veuillez reessayer.</p>
            </div>
          ) : isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted/30 rounded-xl animate-shimmer"
                />
              ))}
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                {tab === "lives" ? (
                  <Radio className="w-6 h-6 text-muted-foreground/40" />
                ) : (
                  <Phone className="w-6 h-6 text-muted-foreground/40" />
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {tab === "lives"
                  ? "Aucun live programme"
                  : "Aucun appel trouve"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {tab === "lives"
                  ? 'Cliquez sur "Nouvel appel" puis "Nouveau live" pour en creer un'
                  : 'Cliquez sur "Nouvel appel" pour en planifier un'}
              </p>
            </div>
          ) : (
            filteredCalls.map((call) => {
              const badge = STATUS_BADGE[call.status] ?? STATUS_BADGE.planifie;
              const joinable = isJoinable(call);
              const isLive = call.call_type === "live";

              return (
                <button
                  key={call.id}
                  onClick={() => handleCallClick(call)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-all duration-200 text-left group"
                >
                  {/* Icone type */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      isLive
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600",
                    )}
                  >
                    {isLive ? (
                      <Radio className="w-5 h-5" />
                    ) : (
                      <Phone className="w-5 h-5" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {call.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <span>
                        {isLive
                          ? "Tous les clients"
                          : (call.client?.full_name ?? "Sans client")}
                      </span>
                      <span className="text-muted-foreground/30">·</span>
                      <span>{formatCallDate(call.date, call.time)}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="font-mono">
                        {call.duration_minutes} min
                      </span>
                    </p>
                  </div>

                  {/* Badge statut */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0",
                      badge.bg,
                      badge.text,
                    )}
                  >
                    <span
                      className={cn("w-1.5 h-1.5 rounded-full", badge.dot)}
                    />
                    {badge.label}
                  </span>

                  {/* Action */}
                  {joinable ? (
                    <Link
                      href={`${prefix}/calls/${call.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 flex items-center gap-1.5 shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Rejoindre
                    </Link>
                  ) : call.status === "realise" ? (
                    <span className="h-8 px-3 rounded-xl bg-muted/50 text-xs font-medium text-muted-foreground flex items-center gap-1.5 shrink-0">
                      Voir
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <SimpleCallFormModal
        open={showCallForm}
        onClose={() => {
          setShowCallForm(false);
          setEditCall(null);
        }}
        editCall={null}
      />

      <LiveFormModal
        open={showLiveForm}
        onClose={() => setShowLiveForm(false)}
      />

      {/* Instant call modal */}
      {instantCallLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setInstantCallLink(null)}
          />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 mx-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Appel instantane cree
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Partagez ce lien pour inviter quelqu&apos;un
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInstantCallLink(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Link display */}
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={instantCallLink}
                className="flex-1 h-10 px-3 bg-muted/50 rounded-xl text-sm text-foreground border border-border font-mono truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(instantCallLink);
                  toast.success("Lien copie !");
                }}
                className="h-10 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copier
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setInstantCallLink(null);
                  router.push(`${prefix}/calls/${instantCallId}`);
                }}
                className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Rejoindre l&apos;appel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legacy form for editing existing calls */}
      <CallFormModal
        open={showLegacyForm}
        onClose={() => {
          setShowLegacyForm(false);
          setEditCall(null);
        }}
        editCall={editCall}
      />
    </motion.div>
  );
}
