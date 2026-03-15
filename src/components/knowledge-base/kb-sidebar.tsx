"use client";

import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  FileText,
  FolderOpen,
  Loader2,
  Book,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAllKnowledgeBasePages,
  useCreatePage,
  useSearchPages,
  buildPageTree,
} from "@/hooks/use-knowledge-base";
import type { KnowledgeBasePage } from "@/types/database";

// ─── Categories wiki ─────────────────────────────────────────────

const WIKI_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "marche", label: "Marche" },
  { value: "offre", label: "Offre" },
  { value: "communication", label: "Communication" },
  { value: "acquisition", label: "Acquisition" },
  { value: "conversion", label: "Conversion" },
  { value: "faq", label: "FAQ" },
] as const;

// ─── Icone par defaut ────────────────────────────────────────────

function PageIcon({ icon }: { icon: string | null }) {
  if (icon) {
    return <span className="text-sm leading-none">{icon}</span>;
  }
  return <FileText className="w-4 h-4 text-muted-foreground" />;
}

// ─── Noeud d'arbre recursif ──────────────────────────────────────

interface TreeNodeProps {
  page: KnowledgeBasePage;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  canEdit: boolean;
  depth: number;
}

function TreeNode({
  page,
  selectedId,
  onSelect,
  onCreateChild,
  canEdit,
  depth,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = page.children && page.children.length > 0;
  const isSelected = selectedId === page.id;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer text-sm transition-colors",
          isSelected
            ? "bg-primary/10 text-primary font-medium"
            : "text-foreground hover:bg-muted/60",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(page.id)}
      >
        {/* Expand/collapse */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded shrink-0 transition-colors",
            hasChildren ? "hover:bg-muted text-muted-foreground" : "invisible",
          )}
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Icon */}
        <PageIcon icon={page.icon} />

        {/* Title */}
        <span className="truncate flex-1 text-[13px]">
          {page.title || "Sans titre"}
        </span>

        {/* Add child */}
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild(page.id);
            }}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground shrink-0 transition-opacity"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {page.children!.map((child) => (
            <TreeNode
              key={child.id}
              page={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              canEdit={canEdit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar principale ──────────────────────────────────────────

interface KBSidebarProps {
  selectedPageId: string | undefined;
  onSelectPage: (id: string) => void;
  canEdit: boolean;
}

export function KBSidebar({
  selectedPageId,
  onSelectPage,
  canEdit,
}: KBSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: allPages, isLoading } = useAllKnowledgeBasePages();
  const { data: searchResults, isLoading: isSearching } =
    useSearchPages(searchQuery);
  const createPage = useCreatePage();

  const tree = useMemo(() => {
    if (!allPages) return [];
    const filtered =
      filterCategory === "all"
        ? allPages
        : allPages.filter((p) => p.category === filterCategory);
    return buildPageTree(filtered);
  }, [allPages, filterCategory]);

  const handleCreatePage = async (parentId?: string) => {
    const page = await createPage.mutateAsync({
      title: "Nouvelle page",
      parent_id: parentId ?? null,
      category:
        filterCategory !== "all"
          ? (filterCategory as KnowledgeBasePage["category"])
          : "general",
    });
    onSelectPage(page.id);
  };

  const displayPages = searchQuery.trim().length >= 2 ? searchResults : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 space-y-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Base de connaissances
            </h2>
          </div>
          {canEdit && (
            <button
              onClick={() => handleCreatePage()}
              disabled={createPage.isPending}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {createPage.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilterCategory("all")}
            className={cn(
              "h-6 px-2 rounded-md text-[11px] font-medium transition-colors",
              filterCategory === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            Tout
          </button>
          {WIKI_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={cn(
                "h-6 px-2 rounded-md text-[11px] font-medium transition-colors",
                filterCategory === cat.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pages tree or search results */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading || isSearching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : displayPages ? (
          // Search results
          displayPages.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">Aucun resultat</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {displayPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    onSelectPage(page.id);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm text-left transition-colors",
                    selectedPageId === page.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted/60",
                  )}
                >
                  <PageIcon icon={page.icon} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] truncate">
                      {page.title || "Sans titre"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate capitalize">
                      {page.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : tree.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Aucune page</p>
            {canEdit && (
              <button
                onClick={() => handleCreatePage()}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Creer la premiere page
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {tree.map((page) => (
              <TreeNode
                key={page.id}
                page={page}
                selectedId={selectedPageId}
                onSelect={onSelectPage}
                onCreateChild={(parentId) => handleCreatePage(parentId)}
                canEdit={canEdit}
                depth={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
