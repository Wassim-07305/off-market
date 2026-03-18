"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useAuditLogs, useAuditActions } from "@/hooks/use-audit-logs";
import type { AuditLog, Profile } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Filter,
  Search,
} from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  login: "bg-blue-500/10 text-blue-600",
  logout: "bg-slate-500/10 text-slate-600",
  create: "bg-emerald-500/10 text-emerald-600",
  update: "bg-amber-500/10 text-amber-600",
  delete: "bg-red-500/10 text-red-600",
};

function getActionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) =>
    action.toLowerCase().includes(k),
  );
  return key ? ACTION_COLORS[key] : "bg-muted text-muted-foreground";
}

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ getValue }) => {
      const val = getValue<string>();
      return (
        <span className="text-xs font-mono text-muted-foreground tabular-nums whitespace-nowrap">
          {new Date(val).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      );
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "user",
    header: "Utilisateur",
    cell: ({ getValue }) => {
      const user = getValue<Profile | undefined>();
      if (!user) {
        return (
          <span className="text-xs text-muted-foreground italic">Systeme</span>
        );
      }
      return (
        <div className="flex items-center gap-2">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt=""
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary">
              {user.full_name?.charAt(0) ?? "?"}
            </div>
          )}
          <span className="text-xs text-foreground truncate max-w-[120px]">
            {user.full_name}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ getValue }) => {
      const action = getValue<string>();
      return (
        <span
          className={cn(
            "text-[11px] font-medium px-2 py-0.5 rounded-full",
            getActionColor(action),
          )}
        >
          {action}
        </span>
      );
    },
  },
  {
    accessorKey: "entity_type",
    header: "Entite",
    cell: ({ row }) => {
      const type = row.original.entity_type;
      const id = row.original.entity_id;
      if (!type)
        return <span className="text-xs text-muted-foreground">-</span>;
      return (
        <div className="text-xs">
          <span className="text-foreground">{type}</span>
          {id && (
            <span className="text-muted-foreground ml-1 font-mono text-[10px]">
              {id.slice(0, 8)}...
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "metadata",
    header: "Details",
    cell: ({ getValue }) => {
      const metadata = getValue<Record<string, unknown>>();
      if (!metadata || Object.keys(metadata).length === 0) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      const summary = Object.entries(metadata)
        .slice(0, 2)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(", ");
      return (
        <span
          className="text-[11px] text-muted-foreground truncate max-w-[200px] block"
          title={JSON.stringify(metadata, null, 2)}
        >
          {summary}
        </span>
      );
    },
    enableSorting: false,
  },
];

export function AuditLogTable() {
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: logs, isLoading } = useAuditLogs({
    action: actionFilter || undefined,
    from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    to: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : undefined,
    limit: 200,
  });

  const { data: actions } = useAuditActions();

  // Client-side user name filter
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (!userFilter) return logs;
    const lower = userFilter.toLowerCase();
    return logs.filter(
      (log) =>
        log.user?.full_name?.toLowerCase().includes(lower) ||
        log.user?.email?.toLowerCase().includes(lower),
    );
  }, [logs, userFilter]);

  const table = useReactTable({
    data: filteredLogs,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 25 },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            Recherche
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Rechercher..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* User filter */}
        <div className="min-w-[150px]">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            Utilisateur
          </label>
          <input
            type="text"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="Filtrer par nom..."
            className="w-full h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Action filter */}
        <div className="min-w-[140px]">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            Action
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="">Toutes</option>
            {(actions ?? []).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            Periode
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 px-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 px-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-muted/30">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-left px-3 py-2.5",
                        header.column.getCanSort() &&
                          "cursor-pointer select-none",
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-3 py-2.5">
                      <div className="h-6 animate-shimmer rounded" />
                    </td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-sm text-muted-foreground"
                  >
                    <Filter className="w-6 h-6 mx-auto mb-2 opacity-20" />
                    Aucun log trouve
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()} ({filteredLogs.length} resultats)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
