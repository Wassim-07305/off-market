"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  MousePointer2,
  Hand,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowLeft,
  ChevronDown,
  SquarePlus,
  StickyNote,
  Link2,
  X,
} from "lucide-react";
import { MiroCardComponent } from "./miro-card";
import {
  useMiroCards,
  useCreateMiroCard,
  useUpdateMiroCard,
  useDeleteMiroCard,
  useMiroSections,
  useCreateMiroSection,
  useUpdateMiroSection,
  useDeleteMiroSection,
  useMiroConnections,
  useCreateMiroConnection,
  useDeleteMiroConnection,
  type MiroCard,
  type MiroSection,
} from "@/hooks/use-miro";
import { toast } from "sonner";

interface MiroCanvasProps {
  boardId: string;
  boardTitle: string;
  onBack: () => void;
  onRenameBoard: (title: string) => void;
}

type Tool = "pointer" | "hand";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const GRID_SIZE = 30;

export function MiroCanvas({
  boardId,
  boardTitle,
  onBack,
  onRenameBoard,
}: MiroCanvasProps) {
  const { data: cards } = useMiroCards(boardId);
  const createCard = useCreateMiroCard();
  const updateCard = useUpdateMiroCard();
  const deleteCard = useDeleteMiroCard();

  const { data: sections } = useMiroSections(boardId);
  const createSection = useCreateMiroSection();
  const updateSection = useUpdateMiroSection();
  const deleteSection = useDeleteMiroSection();

  const { data: connections } = useMiroConnections(boardId);
  const createConnection = useCreateMiroConnection();
  const deleteConnection = useDeleteMiroConnection();

  const [tool, setTool] = useState<Tool>("pointer");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(boardTitle);
  const containerRef = useRef<HTMLDivElement>(null);
  const spaceHeldRef = useRef(false);
  const prevToolRef = useRef<Tool>("pointer");
  const dragDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Connect mode state
  const [connectMode, setConnectMode] = useState(false);
  const [connectFromId, setConnectFromId] = useState<string | null>(null);

  // Add dropdown state
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Section drag state
  const [draggingSection, setDraggingSection] = useState<string | null>(null);
  const sectionDragStart = useRef<{
    x: number;
    y: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    setTitleValue(boardTitle);
  }, [boardTitle]);

  // Close add menu on click outside
  useEffect(() => {
    if (!showAddMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAddMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space" && !spaceHeldRef.current) {
        e.preventDefault();
        spaceHeldRef.current = true;
        prevToolRef.current = tool;
        setTool("hand");
        return;
      }
      if (e.key === "v" || e.key === "V") setTool("pointer");
      if (e.key === "h" || e.key === "H") setTool("hand");
      if (e.key === "Escape") {
        if (connectMode) {
          setConnectMode(false);
          setConnectFromId(null);
          return;
        }
        setSelectedCardId(null);
        setTool("pointer");
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedCardId) {
          deleteCard.mutate({ id: selectedCardId, boardId });
          setSelectedCardId(null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && spaceHeldRef.current) {
        spaceHeldRef.current = false;
        setTool(prevToolRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [tool, selectedCardId, deleteCard, boardId, connectMode]);

  // Zoom centered on mouse position
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      if (e.ctrlKey || e.metaKey) {
        const factor = e.deltaY > 0 ? 0.92 : 1.08;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
        const ratio = newZoom / zoom;
        const rect = container.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        setPan((p) => ({
          x: cx - ratio * (cx - p.x),
          y: cy - ratio * (cy - p.y),
        }));
        setZoom(newZoom);
      } else {
        setPan((p) => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY,
        }));
      }
    },
    [zoom],
  );

  // Attach wheel with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        tool === "hand" ||
        e.button === 1 ||
        e.button === 2 ||
        (e.button === 0 && e.altKey)
      ) {
        setIsPanning(true);
        panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        e.preventDefault();
      } else if (tool === "pointer" && e.target === e.currentTarget) {
        setSelectedCardId(null);
      }
    },
    [tool, pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
      }
    },
    [isPanning],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Add card at center of viewport
  const handleAddCard = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = (rect.width / 2 - pan.x) / zoom;
    const centerY = (rect.height / 2 - pan.y) / zoom;

    createCard.mutate({
      board_id: boardId,
      x: centerX - 200,
      y: centerY - 100,
      width: 420,
      title: "Sans titre",
      content: "Cliquez pour editer",
      card_type: "default",
      style: { label: "NOUVELLE CARTE" },
    });
    setShowAddMenu(false);
  }, [boardId, createCard, pan, zoom]);

  // Add section at center of viewport
  const handleAddSection = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = (rect.width / 2 - pan.x) / zoom;
    const centerY = (rect.height / 2 - pan.y) / zoom;

    createSection.mutate({
      board_id: boardId,
      name: "Nouvelle section",
      x: centerX - 100,
      y: centerY - 40,
      sort_order: (sections?.length ?? 0) + 1,
    });
    setShowAddMenu(false);
  }, [boardId, createSection, pan, zoom, sections]);

  // Enter connect mode
  const handleStartConnectMode = useCallback(() => {
    setConnectMode(true);
    setConnectFromId(null);
    setShowAddMenu(false);
    toast.success(
      "Mode connecteur active. Cliquez sur deux cartes pour les relier.",
    );
  }, []);

  // Handle connect clicks on cards
  const handleConnectClick = useCallback(
    (cardId: string) => {
      if (!connectMode) return;

      if (!connectFromId) {
        setConnectFromId(cardId);
        toast.success("Carte source selectionnee. Cliquez sur la carte cible.");
      } else {
        if (cardId === connectFromId) {
          toast.error("Impossible de relier une carte a elle-meme");
          return;
        }
        const exists = connections?.some(
          (c) =>
            (c.from_card_id === connectFromId && c.to_card_id === cardId) ||
            (c.from_card_id === cardId && c.to_card_id === connectFromId),
        );
        if (exists) {
          toast.error("Ces cartes sont deja reliees");
          setConnectMode(false);
          setConnectFromId(null);
          return;
        }
        createConnection.mutate({
          board_id: boardId,
          from_card_id: connectFromId,
          to_card_id: cardId,
        });
        setConnectMode(false);
        setConnectFromId(null);
      }
    },
    [connectMode, connectFromId, connections, createConnection, boardId],
  );

  // Card drag handler with debounce
  const handleCardDragEnd = useCallback(
    (cardId: string, newX: number, newY: number) => {
      if (dragDebounceRef.current) clearTimeout(dragDebounceRef.current);
      dragDebounceRef.current = setTimeout(() => {
        updateCard.mutate({ id: cardId, boardId, x: newX, y: newY });
      }, 300);
    },
    [updateCard, boardId],
  );

  // Card update handler
  const handleCardUpdate = useCallback(
    (cardId: string, updates: Record<string, unknown>) => {
      updateCard.mutate({ id: cardId, boardId, ...updates });
    },
    [updateCard, boardId],
  );

  // Card delete handler
  const handleCardDelete = useCallback(
    (cardId: string) => {
      deleteCard.mutate({ id: cardId, boardId });
      setSelectedCardId(null);
    },
    [deleteCard, boardId],
  );

  // Title save
  const handleTitleSave = useCallback(() => {
    setEditingTitle(false);
    if (titleValue.trim() && titleValue !== boardTitle) {
      onRenameBoard(titleValue.trim());
    }
  }, [titleValue, boardTitle, onRenameBoard]);

  // Navigate to section
  const handleNavigateToSection = useCallback(
    (section: MiroSection) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      setPan({
        x: rect.width / 2 - section.x * zoom,
        y: rect.height / 2 - section.y * zoom,
      });
    },
    [zoom],
  );

  // Section drag handlers
  const handleSectionMouseDown = useCallback(
    (sectionId: string, section: MiroSection, e: React.MouseEvent) => {
      e.stopPropagation();
      setDraggingSection(sectionId);
      sectionDragStart.current = {
        x: e.clientX,
        y: e.clientY,
        origX: section.x,
        origY: section.y,
      };

      const handleMove = (ev: MouseEvent) => {
        if (!sectionDragStart.current) return;
        const dx = (ev.clientX - sectionDragStart.current.x) / zoom;
        const dy = (ev.clientY - sectionDragStart.current.y) / zoom;
        const el = document.getElementById(`miro-section-${sectionId}`);
        if (el) {
          el.style.left = `${sectionDragStart.current.origX + dx}px`;
          el.style.top = `${sectionDragStart.current.origY + dy}px`;
        }
      };

      const handleUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
        setDraggingSection(null);
        if (!sectionDragStart.current) return;
        const dx = (ev.clientX - sectionDragStart.current.x) / zoom;
        const dy = (ev.clientY - sectionDragStart.current.y) / zoom;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          updateSection.mutate({
            id: sectionId,
            boardId,
            x: sectionDragStart.current.origX + dx,
            y: sectionDragStart.current.origY + dy,
          });
        }
        sectionDragStart.current = null;
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    },
    [zoom, updateSection, boardId],
  );

  // Zoom helpers
  const zoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newZoom = Math.min(MAX_ZOOM, zoom * 1.25);
    const ratio = newZoom / zoom;
    setPan((p) => ({
      x: cx - ratio * (cx - p.x),
      y: cy - ratio * (cy - p.y),
    }));
    setZoom(newZoom);
  }, [zoom]);

  const zoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newZoom = Math.max(MIN_ZOOM, zoom * 0.8);
    const ratio = newZoom / zoom;
    setPan((p) => ({
      x: cx - ratio * (cx - p.x),
      y: cy - ratio * (cy - p.y),
    }));
    setZoom(newZoom);
  }, [zoom]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Build card map for connector positions
  const cardMap = useMemo(() => {
    const map = new Map<string, MiroCard>();
    (cards ?? []).forEach((c) => map.set(c.id, c));
    return map;
  }, [cards]);

  // Connector SVG lines
  const connectorLines = useMemo(() => {
    if (!connections || connections.length === 0) return [];
    return connections
      .map((conn) => {
        const from = cardMap.get(conn.from_card_id);
        const to = cardMap.get(conn.to_card_id);
        if (!from || !to) return null;

        const fromCx = from.x + from.width / 2;
        const fromCy = from.y + 60;
        const toCx = to.x + to.width / 2;
        const toCy = to.y + 60;

        return {
          id: conn.id,
          x1: fromCx,
          y1: fromCy,
          x2: toCx,
          y2: toCy,
        };
      })
      .filter(
        (
          v,
        ): v is {
          id: string;
          x1: number;
          y1: number;
          x2: number;
          y2: number;
        } => v !== null,
      );
  }, [connections, cardMap]);

  // Minimap data
  const minimapData = useMemo(() => {
    const cardList: MiroCard[] = cards ?? [];
    const sectionList: MiroSection[] = sections ?? [];
    if (cardList.length === 0 && sectionList.length === 0) return null;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    cardList.forEach((c) => {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + c.width);
      maxY = Math.max(maxY, c.y + 200);
    });
    sectionList.forEach((s) => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + 200);
      maxY = Math.max(maxY, s.y + 40);
    });

    if (minX === Infinity) return null;

    const padding = 60;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const cw = maxX - minX;
    const ch = maxY - minY;
    const mmW = 220;
    const mmH = 100;
    const scale = Math.min(mmW / cw, mmH / ch);

    return { minX, minY, cw, ch, scale, cards: cardList, mmW, mmH };
  }, [cards, sections]);

  // Dot grid background style
  const gridStyle = useMemo(
    () => ({
      position: "fixed" as const,
      inset: 0,
      zIndex: 0,
      pointerEvents: "none" as const,
      backgroundImage:
        "radial-gradient(circle, rgba(26,23,20,0.06) 1px, transparent 1px)",
      backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
      backgroundPosition: `${pan.x % (GRID_SIZE * zoom)}px ${pan.y % (GRID_SIZE * zoom)}px`,
    }),
    [zoom, pan],
  );

  // Canvas transform style
  const canvasTransformStyle = useMemo(
    () => ({
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: "0 0",
      position: "absolute" as const,
      top: 0,
      left: 0,
      willChange: "transform" as const,
    }),
    [pan, zoom],
  );

  // Cursor based on tool and state
  const cursorClass = useMemo(() => {
    if (connectMode) return "cursor-crosshair";
    if (isPanning) return "cursor-grabbing";
    if (tool === "hand") return "cursor-grab";
    return "cursor-default";
  }, [tool, isPanning, connectMode]);

  // Handle minimap click
  const handleMinimapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!minimapData) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const canvasX = mx / minimapData.scale + minimapData.minX;
      const canvasY = my / minimapData.scale + minimapData.minY;

      const container = containerRef.current;
      if (!container) return;
      const cr = container.getBoundingClientRect();

      setPan({
        x: cr.width / 2 - canvasX * zoom,
        y: cr.height / 2 - canvasY * zoom,
      });
    },
    [minimapData, zoom],
  );

  // SVG bounds for connectors
  const svgBounds = useMemo(() => {
    if (connectorLines.length === 0) return { width: 0, height: 0 };
    let maxX = 0,
      maxY = 0;
    connectorLines.forEach((l) => {
      maxX = Math.max(maxX, l.x1, l.x2);
      maxY = Math.max(maxY, l.y1, l.y2);
    });
    return { width: maxX + 500, height: maxY + 500 };
  }, [connectorLines]);

  return (
    <div
      className="fixed inset-0 z-40"
      style={{
        fontFamily: "'Montserrat', system-ui, sans-serif",
        background: "#EDEAE4",
        color: "#1A1714",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Dot grid background */}
      <div style={gridStyle} />

      {/* Back button - top left */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 1000,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "#FFFFFF",
            border: "1px solid rgba(26, 23, 20, 0.08)",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(26, 23, 20, 0.06)",
            cursor: "pointer",
            fontFamily: "'Montserrat', system-ui, sans-serif",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#6B6560",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#1A1714";
            e.currentTarget.style.borderColor = "rgba(26, 23, 20, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B6560";
            e.currentTarget.style.borderColor = "rgba(26, 23, 20, 0.08)";
          }}
        >
          <ArrowLeft size={15} />
          Mes tableaux
        </button>
      </div>

      {/* Board title + Nav pills - top center */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Title */}
        {editingTitle ? (
          <input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave();
              if (e.key === "Escape") {
                setTitleValue(boardTitle);
                setEditingTitle(false);
              }
            }}
            style={{
              padding: "6px 16px",
              background: "#FFFFFF",
              border: "1px solid rgba(175, 0, 0, 0.25)",
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(26, 23, 20, 0.06)",
              fontFamily: "'Montserrat', system-ui, sans-serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#1A1714",
              outline: "none",
              textAlign: "center",
              minWidth: 200,
            }}
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            style={{
              padding: "6px 16px",
              background: "#FFFFFF",
              border: "1px solid rgba(26, 23, 20, 0.08)",
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(26, 23, 20, 0.06)",
              cursor: "pointer",
              fontFamily: "'Montserrat', system-ui, sans-serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#1A1714",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(175, 0, 0, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(26, 23, 20, 0.08)";
            }}
          >
            {boardTitle}
          </button>
        )}

        {/* Nav pills for sections */}
        {sections && sections.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#FFFFFF",
              border: "1px solid rgba(26, 23, 20, 0.08)",
              borderRadius: 10,
              padding: 4,
              boxShadow: "0 2px 8px rgba(26, 23, 20, 0.06)",
              userSelect: "none",
            }}
          >
            {sections.map((section) => (
              <NavPill
                key={section.id}
                section={section}
                onNavigate={() => handleNavigateToSection(section)}
                onDelete={() =>
                  deleteSection.mutate({ id: section.id, boardId })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Connect mode indicator */}
      {connectMode && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "#AF0000",
            color: "#fff",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(175, 0, 0, 0.3)",
            fontFamily: "'Montserrat', system-ui, sans-serif",
            fontSize: "0.78rem",
            fontWeight: 600,
          }}
        >
          <Link2 size={14} />
          {connectFromId
            ? "Cliquez sur la carte cible"
            : "Cliquez sur la carte source"}
          <button
            onClick={() => {
              setConnectMode(false);
              setConnectFromId(null);
            }}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: 6,
              padding: "2px 6px",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Canvas area */}
      <div
        ref={containerRef}
        className={cursorClass}
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        {/* Transformed canvas */}
        <div style={canvasTransformStyle}>
          {/* SVG Connectors layer */}
          {connectorLines.length > 0 && (
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: svgBounds.width,
                height: svgBounds.height,
                zIndex: 0,
                pointerEvents: "none",
              }}
            >
              {connectorLines.map((line) => (
                <line
                  key={line.id}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#AF0000"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  opacity={0.18}
                  style={{ pointerEvents: "auto", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Supprimer ce connecteur ?")) {
                      deleteConnection.mutate({
                        id: line.id,
                        boardId,
                      });
                    }
                  }}
                  onMouseEnter={(e) => {
                    (e.target as SVGLineElement).setAttribute("opacity", "0.5");
                    (e.target as SVGLineElement).setAttribute(
                      "stroke-width",
                      "3",
                    );
                  }}
                  onMouseLeave={(e) => {
                    (e.target as SVGLineElement).setAttribute(
                      "opacity",
                      "0.18",
                    );
                    (e.target as SVGLineElement).setAttribute(
                      "stroke-width",
                      "2",
                    );
                  }}
                />
              ))}
            </svg>
          )}

          {/* Section labels */}
          {(sections ?? []).map((section) => (
            <div
              key={section.id}
              id={`miro-section-${section.id}`}
              style={{
                position: "absolute",
                left: section.x,
                top: section.y,
                fontFamily: "'Montserrat', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "1.8rem",
                color: "#AF0000",
                opacity: 0.1,
                letterSpacing: "-0.02em",
                pointerEvents: "auto",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                cursor: draggingSection === section.id ? "grabbing" : "grab",
                userSelect: "none",
                zIndex: 1,
              }}
              onMouseDown={(e) =>
                handleSectionMouseDown(section.id, section, e)
              }
              onDoubleClick={(e) => {
                e.stopPropagation();
                const newName = window.prompt(
                  "Nom de la section :",
                  section.name,
                );
                if (newName && newName !== section.name) {
                  updateSection.mutate({
                    id: section.id,
                    boardId,
                    name: newName,
                  });
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (
                  window.confirm(`Supprimer la section "${section.name}" ?`)
                ) {
                  deleteSection.mutate({ id: section.id, boardId });
                }
              }}
            >
              {section.name}
            </div>
          ))}

          {/* Cards */}
          {(cards ?? ([] as MiroCard[])).map((card, index) => (
            <MiroCardComponent
              key={card.id}
              card={card}
              selected={selectedCardId === card.id}
              badgeNumber={index + 1}
              connectMode={connectMode}
              onSelect={() => setSelectedCardId(card.id)}
              onStartDrag={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const origX = card.x;
                const origY = card.y;

                const handleMove = (ev: MouseEvent) => {
                  const dx = (ev.clientX - startX) / zoom;
                  const dy = (ev.clientY - startY) / zoom;
                  const el = document.getElementById(`miro-card-${card.id}`);
                  if (el) {
                    el.style.left = `${origX + dx}px`;
                    el.style.top = `${origY + dy}px`;
                  }
                };

                const handleUp = (ev: MouseEvent) => {
                  document.removeEventListener("mousemove", handleMove);
                  document.removeEventListener("mouseup", handleUp);
                  const dx = (ev.clientX - startX) / zoom;
                  const dy = (ev.clientY - startY) / zoom;
                  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                    handleCardDragEnd(card.id, origX + dx, origY + dy);
                  }
                };

                document.addEventListener("mousemove", handleMove);
                document.addEventListener("mouseup", handleUp);
              }}
              onUpdate={(updates) => handleCardUpdate(card.id, updates)}
              onDelete={() => handleCardDelete(card.id)}
              onConnectStart={handleConnectClick}
              zoom={zoom}
            />
          ))}
        </div>
      </div>

      {/* Toolbar - bottom center (Miro style) */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "#FFFFFF",
          border: "1px solid rgba(26, 23, 20, 0.08)",
          borderRadius: 12,
          padding: 4,
          boxShadow: "0 6px 24px rgba(26, 23, 20, 0.08)",
          zIndex: 1000,
          userSelect: "none",
        }}
      >
        {/* Pointer tool */}
        <ToolbarButton
          active={tool === "pointer" && !connectMode}
          onClick={() => {
            setTool("pointer");
            setConnectMode(false);
            setConnectFromId(null);
          }}
          title="Pointeur (V)"
        >
          <MousePointer2 size={15} />
        </ToolbarButton>

        {/* Hand tool */}
        <ToolbarButton
          active={tool === "hand"}
          onClick={() => setTool("hand")}
          title="Main (H)"
        >
          <Hand size={16} />
        </ToolbarButton>

        <ToolbarSep />

        {/* Add dropdown */}
        <div style={{ position: "relative" }} ref={addMenuRef}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            title="Ajouter"
            style={{
              width: 48,
              height: 36,
              border: "none",
              background: showAddMenu ? "#AF0000" : "none",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              color: showAddMenu ? "#FFFFFF" : "#6B6560",
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!showAddMenu) {
                e.currentTarget.style.background = "#F0EDE6";
                e.currentTarget.style.color = "#1A1714";
              }
            }}
            onMouseLeave={(e) => {
              if (!showAddMenu) {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#6B6560";
              }
            }}
          >
            <Plus size={16} />
            <ChevronDown size={10} />
          </button>

          {/* Dropdown menu */}
          {showAddMenu && (
            <div
              style={{
                position: "absolute",
                bottom: 44,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#FFFFFF",
                border: "1px solid rgba(26, 23, 20, 0.08)",
                borderRadius: 12,
                boxShadow: "0 6px 24px rgba(26, 23, 20, 0.08)",
                padding: 6,
                minWidth: 180,
                zIndex: 1001,
              }}
            >
              <AddMenuItem
                icon={<SquarePlus size={14} />}
                label="Carte"
                onClick={handleAddCard}
              />
              <AddMenuItem
                icon={<StickyNote size={14} />}
                label="Section"
                onClick={handleAddSection}
              />
              <AddMenuItem
                icon={<Link2 size={14} />}
                label="Connecteur"
                onClick={handleStartConnectMode}
              />
            </div>
          )}
        </div>

        <ToolbarSep />

        {/* Zoom controls */}
        <ToolbarButton active={false} onClick={zoomOut} title="Zoom -">
          <ZoomOut size={15} />
        </ToolbarButton>

        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.68rem",
            fontWeight: 500,
            color: "#9B9590",
            minWidth: 48,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {Math.round(zoom * 100)}%
        </span>

        <ToolbarButton active={false} onClick={zoomIn} title="Zoom +">
          <ZoomIn size={15} />
        </ToolbarButton>

        <ToolbarSep />

        {/* Reset / fit */}
        <ToolbarButton active={false} onClick={resetView} title="Reset (0)">
          <Maximize2 size={15} />
        </ToolbarButton>
      </div>

      {/* Minimap - bottom right */}
      {minimapData && (
        <div
          onClick={handleMinimapClick}
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: 220,
            height: 100,
            background: "#FFFFFF",
            border: "1px solid rgba(26, 23, 20, 0.08)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(26, 23, 20, 0.06)",
            zIndex: 1000,
            cursor: "pointer",
          }}
        >
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {/* Card dots */}
            {minimapData.cards.map((c) => (
              <div
                key={c.id}
                style={{
                  position: "absolute",
                  left: (c.x - minimapData.minX) * minimapData.scale,
                  top: (c.y - minimapData.minY) * minimapData.scale,
                  width: Math.max(c.width * minimapData.scale, 3),
                  height: Math.max(120 * minimapData.scale, 2),
                  background: "#AF0000",
                  borderRadius: 1,
                  opacity: 0.5,
                }}
              />
            ))}
            {/* Viewport indicator */}
            <MinimapViewport
              containerRef={containerRef}
              zoom={zoom}
              pan={pan}
              minimapData={minimapData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Toolbar Sub-Components ──────────────────────────

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 36,
        height: 36,
        border: "none",
        background: active ? "#AF0000" : hovered ? "#F0EDE6" : "none",
        borderRadius: 8,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "#FFFFFF" : hovered ? "#1A1714" : "#6B6560",
        fontSize: "0.85rem",
        fontWeight: 600,
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background: "rgba(26, 23, 20, 0.08)",
        margin: "0 4px",
      }}
    />
  );
}

// ─── Add Menu Item ───────────────────────────────────

function AddMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 14px",
        border: "none",
        borderRadius: 8,
        background: hovered ? "#F0EDE6" : "none",
        cursor: "pointer",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        fontSize: "0.78rem",
        fontWeight: 500,
        color: "#1A1714",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "background 0.15s ease",
      }}
    >
      <span style={{ color: "#AF0000", display: "flex" }}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Nav Pill ────────────────────────────────────────

function NavPill({
  section,
  onNavigate,
  onDelete,
}: {
  section: MiroSection;
  onNavigate: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onNavigate}
      onContextMenu={(e) => {
        e.preventDefault();
        if (window.confirm(`Supprimer la section "${section.name}" ?`)) {
          onDelete();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "6px 14px",
        border: "none",
        background: hovered ? "#F0EDE6" : "none",
        borderRadius: 7,
        cursor: "pointer",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        fontSize: "0.7rem",
        fontWeight: 600,
        color: hovered ? "#1A1714" : "#9B9590",
        transition: "all 0.25s ease",
        whiteSpace: "nowrap",
      }}
    >
      {section.name}
    </button>
  );
}

// ─── Minimap Viewport ────────────────────────────────

function MinimapViewport({
  containerRef,
  zoom,
  pan,
  minimapData,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  pan: { x: number; y: number };
  minimapData: {
    minX: number;
    minY: number;
    scale: number;
  };
}) {
  const container = containerRef.current;
  if (!container) return null;

  const rect = container.getBoundingClientRect();
  const vw = rect.width;
  const vh = rect.height;

  const left = (-pan.x / zoom - minimapData.minX) * minimapData.scale;
  const top = (-pan.y / zoom - minimapData.minY) * minimapData.scale;
  const width = (vw / zoom) * minimapData.scale;
  const height = (vh / zoom) * minimapData.scale;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        border: "1.5px solid #AF0000",
        borderRadius: 2,
        background: "rgba(175, 0, 0, 0.06)",
        pointerEvents: "none",
        transition: "all 0.15s ease",
      }}
    />
  );
}
