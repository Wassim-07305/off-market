"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import {
  useBookingPages,
  useCreateBookingPage,
  useDeleteBookingPage,
  useUpdateBookingPage,
  useBookingAvailability,
  useUpsertAvailability,
  useBookingExceptions,
  useAddBookingException,
  useRemoveBookingException,
  useBookings,
  useBookingKPIs,
  type BookingPage,
  type BookingAvailability,
  type QualificationField,
} from "@/hooks/use-booking-pages";
import { cn } from "@/lib/utils";
import {
  Eye,
  Users,
  CalendarCheck,
  TrendingUp,
  Plus,
  Copy,
  ExternalLink,
  Trash2,
  Settings,
  X,
  Check,
  Clock,
  Ban,
  Phone,
  Mail,
  User,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  CalendarX,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const PERIOD_OPTIONS = [
  { value: "7d" as const, label: "7 jours" },
  { value: "30d" as const, label: "30 jours" },
  { value: "90d" as const, label: "90 jours" },
  { value: "all" as const, label: "Tout" },
];

type Period = "7d" | "30d" | "90d" | "all";

export default function BookingAdminPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [selectedPage, setSelectedPage] = useState<BookingPage | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: pages, isLoading: pagesLoading } = useBookingPages();
  const { data: kpis, isLoading: kpisLoading } = useBookingKPIs(
    undefined,
    period,
  );
  const { data: recentBookings, isLoading: bookingsLoading } = useBookings({
    limit: 10,
  });

  return (
    <motion.div
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Booking
          </h1>
          <p className="text-sm text-muted-foreground/80 mt-1.5 leading-relaxed">
            Gerez vos pages de reservation et suivez les rendez-vous
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtre periode */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  period === opt.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle page
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KPICard
          icon={Eye}
          label="Vues"
          value={kpisLoading ? "..." : String(kpis?.views ?? 0)}
          color="blue"
        />
        <KPICard
          icon={Users}
          label="Contacts"
          value={kpisLoading ? "..." : String(kpis?.contacts ?? 0)}
          color="purple"
        />
        <KPICard
          icon={CalendarCheck}
          label="Rendez-vous"
          value={kpisLoading ? "..." : String(kpis?.bookings ?? 0)}
          color="emerald"
        />
        <KPICard
          icon={TrendingUp}
          label="Taux conversion"
          value={kpisLoading ? "..." : `${kpis?.conversionRate ?? 0}%`}
          color="amber"
        />
      </motion.div>

      {/* Pages de booking */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-border rounded-xl p-6"
      >
        <h2 className="text-sm font-bold text-foreground tracking-tight mb-4">
          Pages de reservation
        </h2>

        {pagesLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !pages || pages.length === 0 ? (
          <div className="text-center py-12">
            <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune page de booking
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Creer votre premiere page
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {pages.map((page) => (
              <BookingPageRow
                key={page.id}
                page={page}
                onSelect={() => setSelectedPage(page)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Reservations recentes */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-border rounded-xl p-6"
      >
        <h2 className="text-sm font-bold text-foreground tracking-tight mb-4">
          Dernieres reservations
        </h2>

        {bookingsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !recentBookings || recentBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Aucune reservation pour le moment
          </p>
        ) : (
          <div className="space-y-2">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {booking.prospect_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {booking.prospect_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {booking.prospect_email}
                        </span>
                      )}
                      {booking.prospect_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {booking.prospect_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(booking.date), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.start_time} - {booking.end_time}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal creation */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateBookingPageModal onClose={() => setShowCreateForm(false)} />
        )}
      </AnimatePresence>

      {/* Panel detail page */}
      <AnimatePresence>
        {selectedPage && (
          <BookingPageDetailPanel
            page={selectedPage}
            onClose={() => setSelectedPage(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────

function KPICard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: "blue" | "purple" | "emerald" | "amber";
}) {
  const colorMap = {
    blue: "bg-blue-500/10 ring-blue-500/20 text-blue-500",
    purple: "bg-purple-500/10 ring-purple-500/20 text-purple-500",
    emerald: "bg-emerald-500/10 ring-emerald-500/20 text-emerald-500",
    amber: "bg-amber-500/10 ring-amber-500/20 text-amber-500",
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center ring-1",
            colorMap[color],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground/80 mt-1">{label}</p>
    </div>
  );
}

// ─── Booking Page Row ───────────────────────────────────────

function BookingPageRow({
  page,
  onSelect,
}: {
  page: BookingPage;
  onSelect: () => void;
}) {
  const deleteMutation = useDeleteBookingPage();
  const updateMutation = useUpdateBookingPage();

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${page.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Lien copie dans le presse-papier");
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: page.brand_color }}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {page.title}
          </p>
          <p className="text-xs text-muted-foreground">
            /{page.slug} &middot; {page.slot_duration} min
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle actif */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateMutation.mutate({
              id: page.id,
              is_active: !page.is_active,
            });
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={page.is_active ? "Desactiver" : "Activer"}
        >
          {page.is_active ? (
            <ToggleRight className="w-5 h-5 text-emerald-500" />
          ) : (
            <ToggleLeft className="w-5 h-5" />
          )}
        </button>

        {/* Copier lien */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyLink();
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Copier le lien"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Ouvrir */}
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Ouvrir"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Supprimer */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Supprimer cette page de booking ?")) {
              deleteMutation.mutate(page.id);
            }
          }}
          className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Detail */}
        <button
          onClick={onSelect}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Booking Status Badge ───────────────────────────────────

function BookingStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    confirmed: {
      label: "Confirme",
      className: "bg-emerald-500/10 text-emerald-600",
    },
    pending: {
      label: "En attente",
      className: "bg-amber-500/10 text-amber-600",
    },
    cancelled: {
      label: "Annule",
      className: "bg-red-500/10 text-red-600",
    },
    completed: {
      label: "Termine",
      className: "bg-blue-500/10 text-blue-600",
    },
  };
  const c = config[status] ?? config.confirmed;
  return (
    <span
      className={cn(
        "text-[11px] font-medium px-2 py-0.5 rounded-full ml-3 shrink-0",
        c.className,
      )}
    >
      {c.label}
    </span>
  );
}

// ─── Create Booking Page Modal ──────────────────────────────

function CreateBookingPageModal({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateBookingPage();
  const [title, setTitle] = useState("Prendre rendez-vous");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slotDuration, setSlotDuration] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [minNoticeHours, setMinNoticeHours] = useState(24);
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);
  const [brandColor, setBrandColor] = useState("#AF0000");

  const handleCreate = () => {
    if (!slug.trim()) {
      toast.error("Le slug est obligatoire");
      return;
    }
    createMutation.mutate(
      {
        title,
        slug: slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-"),
        description: description || null,
        slot_duration: slotDuration,
        buffer_minutes: bufferMinutes,
        min_notice_hours: minNoticeHours,
        max_days_ahead: maxDaysAhead,
        brand_color: brandColor,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            Nouvelle page de booking
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Prendre rendez-vous"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Slug (URL)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">/book/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  )
                }
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="appel-decouverte"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Decouvrez comment atteindre 10K/mois..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Duree (min)
              </label>
              <input
                type="number"
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                min={15}
                step={15}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Buffer (min)
              </label>
              <input
                type="number"
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(Number(e.target.value))}
                min={0}
                step={5}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Preavis minimum (h)
              </label>
              <input
                type="number"
                value={minNoticeHours}
                onChange={(e) => setMinNoticeHours(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Jours a l&apos;avance (max)
              </label>
              <input
                type="number"
                value={maxDaysAhead}
                onChange={(e) => setMaxDaysAhead(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Couleur de marque
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">
                {brandColor}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending || !slug.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? "Creation..." : "Creer"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Booking Page Detail Panel ──────────────────────────────

function BookingPageDetailPanel({
  page,
  onClose,
}: {
  page: BookingPage;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "settings" | "availability" | "exceptions" | "qualification"
  >("settings");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-surface border-l border-border w-full max-w-xl h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h2 className="text-lg font-bold text-foreground">{page.title}</h2>
            <p className="text-xs text-muted-foreground">/{page.slug}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(
            [
              { key: "settings", label: "Parametres", icon: Settings },
              { key: "availability", label: "Disponibilites", icon: Clock },
              { key: "exceptions", label: "Exceptions", icon: CalendarX },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors border-b-2",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "settings" && <PageSettingsTab page={page} />}
          {activeTab === "availability" && <AvailabilityTab pageId={page.id} />}
          {activeTab === "exceptions" && <ExceptionsTab pageId={page.id} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────

function PageSettingsTab({ page }: { page: BookingPage }) {
  const updateMutation = useUpdateBookingPage();
  const [title, setTitle] = useState(page.title);
  const [description, setDescription] = useState(page.description ?? "");
  const [slotDuration, setSlotDuration] = useState(page.slot_duration);
  const [bufferMinutes, setBufferMinutes] = useState(page.buffer_minutes);
  const [minNoticeHours, setMinNoticeHours] = useState(page.min_notice_hours);
  const [maxDaysAhead, setMaxDaysAhead] = useState(page.max_days_ahead);
  const [brandColor, setBrandColor] = useState(page.brand_color);
  const [qualificationFields, setQualificationFields] = useState<
    QualificationField[]
  >(page.qualification_fields ?? []);

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${page.slug}`;

  const handleSave = () => {
    updateMutation.mutate({
      id: page.id,
      title,
      description: description || null,
      slot_duration: slotDuration,
      buffer_minutes: bufferMinutes,
      min_notice_hours: minNoticeHours,
      max_days_ahead: maxDaysAhead,
      brand_color: brandColor,
      qualification_fields: qualificationFields,
    });
  };

  const addField = () => {
    setQualificationFields([
      ...qualificationFields,
      {
        id: crypto.randomUUID(),
        label: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const removeField = (id: string) => {
    setQualificationFields(qualificationFields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<QualificationField>) => {
    setQualificationFields(
      qualificationFields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  };

  return (
    <div className="space-y-5">
      {/* Lien public */}
      <div className="p-4 bg-muted/30 rounded-xl border border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Lien public
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-foreground bg-background px-3 py-2 rounded-lg border border-border truncate">
            {publicUrl}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              toast.success("Lien copie");
            }}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Duree (min)
          </label>
          <input
            type="number"
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
            min={15}
            step={15}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Buffer (min)
          </label>
          <input
            type="number"
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(Number(e.target.value))}
            min={0}
            step={5}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Preavis minimum (h)
          </label>
          <input
            type="number"
            value={minNoticeHours}
            onChange={(e) => setMinNoticeHours(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Jours max a l&apos;avance
          </label>
          <input
            type="number"
            value={maxDaysAhead}
            onChange={(e) => setMaxDaysAhead(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Couleur
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-border cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">{brandColor}</span>
        </div>
      </div>

      {/* Champs de qualification */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">
            Champs de qualification
          </label>
          <button
            onClick={addField}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Ajouter
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Nom, email et telephone sont toujours inclus. Ajoutez des champs
          personnalises ici.
        </p>

        {qualificationFields.length > 0 && (
          <div className="space-y-3">
            {qualificationFields.map((field) => (
              <div
                key={field.id}
                className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border"
              >
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) =>
                      updateField(field.id, { label: e.target.value })
                    }
                    placeholder="Libelle du champ"
                    className="w-full px-2 py-1.5 bg-background border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, {
                          type: e.target.value as QualificationField["type"],
                        })
                      }
                      className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground"
                    >
                      <option value="text">Texte</option>
                      <option value="textarea">Texte long</option>
                      <option value="select">Liste</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.id, {
                            required: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      Obligatoire
                    </label>
                  </div>
                  {field.type === "select" && (
                    <input
                      type="text"
                      value={field.options?.join(", ") ?? ""}
                      onChange={(e) =>
                        updateField(field.id, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Options separees par des virgules"
                      className="w-full px-2 py-1.5 bg-background border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  )}
                </div>
                <button
                  onClick={() => removeField(field.id)}
                  className="text-muted-foreground hover:text-red-500 mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="w-full px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}

// ─── Availability Tab ───────────────────────────────────────

function AvailabilityTab({ pageId }: { pageId: string }) {
  const { data: availability, isLoading } = useBookingAvailability(pageId);
  const upsertMutation = useUpsertAvailability();

  // Etat local pour editer
  const [slots, setSlots] = useState<
    {
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_active: boolean;
    }[]
  >([]);
  const [initialized, setInitialized] = useState(false);

  // Init from data
  if (availability && !initialized) {
    if (availability.length > 0) {
      setSlots(
        availability.map((a) => ({
          day_of_week: a.day_of_week,
          start_time: a.start_time,
          end_time: a.end_time,
          is_active: a.is_active,
        })),
      );
    } else {
      // Defaults: lundi-vendredi 9h-18h
      setSlots(
        [1, 2, 3, 4, 5].map((d) => ({
          day_of_week: d,
          start_time: "09:00",
          end_time: "18:00",
          is_active: true,
        })),
      );
    }
    setInitialized(true);
  }

  const toggleDay = (day: number) => {
    const existing = slots.find((s) => s.day_of_week === day);
    if (existing) {
      setSlots(
        slots.map((s) =>
          s.day_of_week === day ? { ...s, is_active: !s.is_active } : s,
        ),
      );
    } else {
      setSlots([
        ...slots,
        {
          day_of_week: day,
          start_time: "09:00",
          end_time: "18:00",
          is_active: true,
        },
      ]);
    }
  };

  const updateSlotTime = (
    day: number,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    setSlots(
      slots.map((s) => (s.day_of_week === day ? { ...s, [field]: value } : s)),
    );
  };

  const handleSave = () => {
    upsertMutation.mutate(
      slots
        .filter((s) => s.is_active)
        .map((s) => ({
          booking_page_id: pageId,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          is_active: true,
        })),
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Definissez les plages horaires disponibles pour chaque jour de la
        semaine.
      </p>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const slot = slots.find((s) => s.day_of_week === day);
          const isActive = slot?.is_active ?? false;

          return (
            <div
              key={day}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                isActive
                  ? "border-border bg-muted/20"
                  : "border-border/50 bg-muted/5 opacity-50",
              )}
            >
              <button onClick={() => toggleDay(day)} className="shrink-0">
                {isActive ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Ban className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              <span className="text-sm font-medium text-foreground w-24 shrink-0">
                {DAY_LABELS[day]}
              </span>

              {isActive && slot && (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) =>
                      updateSlotTime(day, "start_time", e.target.value)
                    }
                    className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground"
                  />
                  <span className="text-xs text-muted-foreground">a</span>
                  <input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) =>
                      updateSlotTime(day, "end_time", e.target.value)
                    }
                    className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground"
                  />
                </div>
              )}

              {!isActive && (
                <span className="text-xs text-muted-foreground">
                  Indisponible
                </span>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={upsertMutation.isPending}
        className="w-full px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {upsertMutation.isPending
          ? "Enregistrement..."
          : "Enregistrer les disponibilites"}
      </button>
    </div>
  );
}

// ─── Exceptions Tab ─────────────────────────────────────────

function ExceptionsTab({ pageId }: { pageId: string }) {
  const { data: exceptions, isLoading } = useBookingExceptions(pageId);
  const addMutation = useAddBookingException();
  const removeMutation = useRemoveBookingException();
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  const handleAdd = () => {
    if (!newDate) {
      toast.error("Selectionnez une date");
      return;
    }
    addMutation.mutate(
      {
        booking_page_id: pageId,
        exception_date: newDate,
        reason: newReason || undefined,
      },
      {
        onSuccess: () => {
          setNewDate("");
          setNewReason("");
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Bloquez des jours specifiques ou vous ne serez pas disponible.
      </p>

      {/* Add new */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-foreground mb-1 block">
            Date
          </label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-foreground mb-1 block">
            Raison
          </label>
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Vacances, formation..."
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={addMutation.isPending}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
        >
          Ajouter
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !exceptions || exceptions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Aucune exception configuree
        </p>
      ) : (
        <div className="space-y-2">
          {exceptions.map((exc) => (
            <div
              key={exc.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(exc.exception_date), "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                </p>
                {exc.reason && (
                  <p className="text-xs text-muted-foreground">{exc.reason}</p>
                )}
              </div>
              <button
                onClick={() => removeMutation.mutate(exc.id)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
