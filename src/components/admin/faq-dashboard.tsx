"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  AlertTriangle,
  Video,
  Trash2,
  Pencil,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  MessageSquare,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils";
import {
  useFaqEntries,
  useFaqAlerts,
  useFaqCategories,
  useUpdateFaqEntry,
  useDeleteFaqEntry,
} from "@/hooks/use-faq";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { FaqEntryModal } from "./faq-entry-modal";

export function FaqDashboard() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: entries = [], isLoading } = useFaqEntries(category);
  const { data: alerts = [] } = useFaqAlerts();
  const { data: categories = [] } = useFaqCategories();
  const updateEntry = useUpdateFaqEntry();
  const deleteEntry = useDeleteFaqEntry();

  // Filter by search
  const filteredEntries = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.question.toLowerCase().includes(q) ||
        e.answer.toLowerCase().includes(q),
    );
  }, [entries, search]);

  // Top questions chart data
  const chartData = useMemo(() => {
    return entries.slice(0, 10).map((e) => ({
      name:
        e.question.length > 30 ? e.question.slice(0, 30) + "..." : e.question,
      occurrences: e.occurrence_count,
    }));
  }, [entries]);

  // Stats
  const stats = useMemo(() => {
    const total = entries.length;
    const autoEnabled = entries.filter((e) => e.auto_answer_enabled).length;
    const totalOccurrences = entries.reduce(
      (acc, e) => acc + e.occurrence_count,
      0,
    );
    return { total, autoEnabled, totalOccurrences, alertCount: alerts.length };
  }, [entries, alerts]);

  const handleToggleAutoAnswer = (id: string, current: boolean) => {
    updateEntry.mutate({ id, auto_answer_enabled: !current });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Supprimer cette question FAQ ?")) {
      deleteEntry.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const categoryOptions = [
    { value: "all", label: "Toutes" },
    ...categories.map((c) => ({
      value: c,
      label: c.charAt(0).toUpperCase() + c.slice(1),
    })),
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-display font-bold text-foreground tracking-tight">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
            Base de connaissances FAQ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerez les questions frequentes et activez les reponses automatiques
            IA
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
          Nouvelle question
        </Button>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Questions FAQ</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.autoEnabled}</p>
              <p className="text-xs text-muted-foreground">
                Auto-reponse active
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalOccurrences}</p>
              <p className="text-xs text-muted-foreground">
                Occurrences totales
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                stats.alertCount > 0 ? "bg-amber-100" : "bg-gray-100",
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-5 w-5",
                  stats.alertCount > 0 ? "text-amber-600" : "text-gray-400",
                )}
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.alertCount}</p>
              <p className="text-xs text-muted-foreground">Alertes (5+/sem.)</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts section */}
      {alerts.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                Questions a fort volume cette semaine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {alert.question}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Posee {alert.weekly_count} fois cette semaine (
                      {alert.occurrence_count} fois au total)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge variant="warning">{alert.weekly_count}x/sem.</Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Video className="h-3.5 w-3.5" />}
                      className="h-7 text-xs"
                      title="Suggerer de creer une video"
                    >
                      Creer video
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top questions chart */}
      {chartData.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle>Top 10 des questions les plus posees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis type="number" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={200}
                      fontSize={11}
                      tick={{ fill: "#6b7280" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="occurrences"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      name="Occurrences"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Input
          placeholder="Rechercher une question..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
          wrapperClassName="flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                category === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* FAQ entries list */}
      <motion.div variants={staggerItem} className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-muted/50"
              />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="Aucune question FAQ"
            description={
              search
                ? "Aucun resultat pour cette recherche"
                : "Ajoutez votre premiere question a la base de connaissances"
            }
            action={
              !search ? (
                <Button
                  icon={<Plus className="h-4 w-4" />}
                  onClick={handleCreate}
                >
                  Ajouter une question
                </Button>
              ) : undefined
            }
          />
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className="group">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        {entry.question}
                      </h3>
                      <Badge
                        variant={
                          entry.occurrence_count >= 10
                            ? "destructive"
                            : entry.occurrence_count >= 5
                              ? "warning"
                              : "secondary"
                        }
                      >
                        +{entry.occurrence_count}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {entry.answer}
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{entry.category}</Badge>
                      {entry.auto_answer_enabled && (
                        <Badge variant="success">
                          <Zap className="mr-1 h-2.5 w-2.5" />
                          Auto-reponse
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        Derniere occurrence :{" "}
                        {formatRelativeDate(entry.last_asked_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleAutoAnswer(
                          entry.id,
                          entry.auto_answer_enabled,
                        )
                      }
                      className={cn(
                        "rounded-lg p-1.5 transition-colors cursor-pointer",
                        entry.auto_answer_enabled
                          ? "text-green-600 hover:bg-green-50"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                      title={
                        entry.auto_answer_enabled
                          ? "Desactiver auto-reponse"
                          : "Activer auto-reponse"
                      }
                    >
                      {entry.auto_answer_enabled ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(entry.id)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>

      {/* Modal */}
      <FaqEntryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        entryId={editingId}
      />
    </motion.div>
  );
}
