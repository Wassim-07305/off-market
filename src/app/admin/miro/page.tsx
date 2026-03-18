"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Plus, Trash2, Presentation } from "lucide-react";
import {
  useMiroBoards,
  useCreateMiroBoard,
  useDeleteMiroBoard,
  useUpdateMiroBoard,
  useMiroCards,
} from "@/hooks/use-miro";
import dynamic from "next/dynamic";
const MiroCanvas = dynamic(
  () =>
    import("@/components/miro/miro-canvas").then((m) => ({
      default: m.MiroCanvas,
    })),
  { ssr: false },
);
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function MiroPage() {
  const { data: boards } = useMiroBoards();
  const createBoard = useCreateMiroBoard();
  const deleteBoard = useDeleteMiroBoard();
  const updateBoard = useUpdateMiroBoard();
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  const activeBoard = (boards ?? []).find((b) => b.id === activeBoardId);

  // If a board is selected, show the canvas
  if (activeBoard) {
    return (
      <MiroCanvas
        boardId={activeBoard.id}
        boardTitle={activeBoard.title}
        onBack={() => setActiveBoardId(null)}
        onRenameBoard={(title) => {
          updateBoard.mutate({ id: activeBoard.id, title });
        }}
      />
    );
  }

  // Otherwise, show the board list
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={staggerItem}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Miro
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tableaux visuels pour organiser vos idees et strategies.
          </p>
        </div>
        <button
          onClick={() =>
            createBoard.mutate("Nouveau tableau", {
              onSuccess: (board) => {
                setActiveBoardId(board.id);
              },
            })
          }
          disabled={createBoard.isPending}
          className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau tableau
        </button>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {(boards ?? []).map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            onOpen={() => setActiveBoardId(board.id)}
            onDelete={() => {
              if (
                confirm(
                  `Supprimer "${board.title}" ? Cette action est irreversible.`,
                )
              ) {
                deleteBoard.mutate(board.id);
              }
            }}
          />
        ))}

        {(boards ?? []).length === 0 && (
          <div className="col-span-full text-center py-16">
            <Presentation className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Aucun tableau. Creez-en un pour commencer.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Board Card with mini preview ──────────────────────────

const PREVIEW_H = 152;

function BoardCard({
  board,
  onOpen,
  onDelete,
}: {
  board: { id: string; title: string; created_at: string };
  onOpen: () => void;
  onDelete: () => void;
}) {
  const { data: cards } = useMiroCards(board.id);
  const allCards = cards ?? [];
  const cardCount = allCards.length;

  // Bounding box of all cards
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const c of allCards) {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x + c.width);
    maxY = Math.max(maxY, c.y + 120);
  }
  const pad = 40;
  const contentW = maxX - minX + pad * 2 || 800;
  const contentH = maxY - minY + pad * 2 || 400;
  const scale = Math.min(300 / contentW, PREVIEW_H / contentH);

  return (
    <div
      onClick={onOpen}
      className="group bg-surface border border-border rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 overflow-hidden"
    >
      {/* Real mini-map: actual card positions + styles, scaled down */}
      <div
        className="relative overflow-hidden border-b border-border"
        style={{ height: PREVIEW_H, background: "#F5F3EE" }}
      >
        {allCards.length > 0 ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: "center center",
              width: contentW,
              height: contentH,
            }}
          >
            {allCards.map((card) => {
              const ct = card.card_type ?? "default";
              const isDark = ct === "dark";
              const isAccentBg = ct === "accent-bg";
              const isAccentBorder = ct === "accent-border";

              return (
                <div
                  key={card.id}
                  style={{
                    position: "absolute",
                    left: card.x - minX + pad,
                    top: card.y - minY + pad,
                    width: card.width,
                    padding: "20px 24px",
                    borderRadius: 12,
                    background: isDark
                      ? "linear-gradient(135deg, #1A1714, #2A2520)"
                      : isAccentBg
                        ? "linear-gradient(135deg, #FFF, rgba(175,0,0,0.02))"
                        : "#FFFFFF",
                    border: isDark
                      ? "1px solid rgba(175,0,0,0.3)"
                      : isAccentBg
                        ? "1px solid rgba(175,0,0,0.15)"
                        : "1px solid rgba(26,23,20,0.08)",
                    borderLeft: isAccentBorder
                      ? "4px solid #AF0000"
                      : undefined,
                    boxShadow: "0 2px 8px rgba(26,23,20,0.06)",
                    overflow: "hidden",
                  }}
                >
                  {card.title && (
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: isDark ? "#FFF" : "#1A1714",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {card.title}
                    </p>
                  )}
                  {card.content && (
                    <p
                      style={{
                        fontSize: 11,
                        lineHeight: 1.4,
                        color: isDark ? "rgba(255,255,255,0.6)" : "#6B6560",
                        margin: card.title ? "6px 0 0" : 0,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {card.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Presentation className="w-8 h-8 text-muted-foreground/20" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {board.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(board.created_at), "d MMM yyyy", { locale: fr })}
            {cardCount > 0 && (
              <>
                {" "}
                · {cardCount} carte{cardCount > 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
