"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, CalendarClock } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { SetterLead, PipelineColumn } from "@/types/setter-crm";
import { usePipelineColumns, useSetterLeads } from "@/hooks/use-setter-crm";
import { SetterProspectDrawer } from "@/components/crm/setter-prospect-drawer";

function isRelanceOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export function SetterPipelineList() {
  const { columns } = usePipelineColumns();
  const { leads } = useSetterLeads();

  const [search, setSearch] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const [drawerLead, setDrawerLead] = useState<SetterLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Column lookup
  const columnMap = useMemo(() => {
    const map: Record<string, PipelineColumn> = {};
    for (const col of columns) {
      map[col.id] = col;
    }
    return map;
  }, [columns]);

  // Filter
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.name.toLowerCase().includes(q));
    }
    if (filterColumn) {
      result = result.filter((l) => l.column_id === filterColumn);
    }
    return result;
  }, [leads, search, filterColumn]);

  const filterOptions = [
    { value: "", label: "Toutes les colonnes" },
    ...columns.map((c) => ({ value: c.id, label: c.name })),
  ];

  function openDrawer(lead: SetterLead) {
    setDrawerLead(lead);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un prospect..."
          icon={<Search className="w-4 h-4" />}
          wrapperClassName="flex-1"
        />
        <Select
          options={filterOptions}
          value={filterColumn}
          onChange={setFilterColumn}
          placeholder="Filtrer par colonne"
          className="min-w-[200px]"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Nom
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Colonne
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Relance
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  CA contracte
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Date ajout
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const col = columnMap[lead.column_id];
                const overdue = isRelanceOverdue(lead.date_relance);

                return (
                  <tr
                    key={lead.id}
                    onClick={() => openDrawer(lead)}
                    className="border-b border-border last:border-b-0 hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        {lead.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {col ? (
                        <Badge variant="secondary">{col.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.date_relance ? (
                        <div className="flex items-center gap-1.5">
                          {overdue && (
                            <CalendarClock className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <span
                            className={cn(
                              "text-sm",
                              overdue
                                ? "text-red-600 font-medium"
                                : "text-muted-foreground",
                            )}
                          >
                            {format(new Date(lead.date_relance), "d MMM yyyy", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(lead.ca_contracte ?? 0) > 0 ? (
                        <span className="font-medium text-foreground">
                          {formatCurrency(lead.ca_contracte ?? 0)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(lead.created_at), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Aucun prospect trouve.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <SetterProspectDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerLead(null);
        }}
        lead={drawerLead}
        columns={columns}
      />
    </div>
  );
}
