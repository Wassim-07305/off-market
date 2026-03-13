"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────

export interface WalkthroughStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface WalkthroughContextValue {
  startTour: (steps: WalkthroughStep[]) => void;
  isActive: boolean;
}

const WalkthroughContext = createContext<WalkthroughContextValue>({
  startTour: () => {},
  isActive: false,
});

export function useWalkthrough() {
  return useContext(WalkthroughContext);
}

// ─── Provider ──────────────────────────────────────────────────

export function WalkthroughProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [steps, setSteps] = useState<WalkthroughStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = isActive ? steps[currentIndex] : null;

  const startTour = useCallback((newSteps: WalkthroughStep[]) => {
    if (newSteps.length === 0) return;
    setSteps(newSteps);
    setCurrentIndex(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setSteps([]);
    setCurrentIndex(0);
    setHighlightRect(null);
  }, []);

  const next = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      endTour();
    }
  }, [currentIndex, steps.length, endTour]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // Position tooltip relative to target element
  useEffect(() => {
    if (!currentStep) return;

    const target = document.querySelector(currentStep.target);
    if (!target) {
      // Skip to next if target not found
      next();
      return;
    }

    const rect = target.getBoundingClientRect();
    setHighlightRect(rect);

    // Scroll target into view
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    const placement = currentStep.placement ?? "bottom";
    const OFFSET = 12;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "bottom":
        top = rect.bottom + OFFSET;
        left = rect.left + rect.width / 2;
        break;
      case "top":
        top = rect.top - OFFSET;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - OFFSET;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + OFFSET;
        break;
    }

    setTooltipPos({ top, left });
  }, [currentStep, currentIndex, next]);

  return (
    <WalkthroughContext.Provider value={{ startTour, isActive }}>
      {children}

      {isActive &&
        currentStep &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-200"
              onClick={endTour}
            />

            {/* Highlight cutout */}
            {highlightRect && (
              <div
                className="fixed z-[9999] rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-transparent pointer-events-none transition-all duration-300"
                style={{
                  top: highlightRect.top - 4,
                  left: highlightRect.left - 4,
                  width: highlightRect.width + 8,
                  height: highlightRect.height + 8,
                }}
              />
            )}

            {/* Tooltip */}
            <div
              ref={tooltipRef}
              className="fixed z-[10000] w-72 bg-surface border border-border rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200"
              style={{
                top: tooltipPos.top,
                left: tooltipPos.left,
                transform: "translateX(-50%)",
              }}
            >
              {/* Close */}
              <button
                onClick={endTour}
                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <div className="p-4">
                {/* Step counter */}
                <p className="text-[10px] font-medium text-primary uppercase tracking-wider mb-1">
                  Etape {currentIndex + 1}/{steps.length}
                </p>

                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {currentStep.title}
                </h4>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {currentStep.content}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <button
                  onClick={prev}
                  disabled={currentIndex === 0}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Precedent
                </button>

                <button
                  onClick={next}
                  className="h-7 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-1"
                >
                  {currentIndex === steps.length - 1 ? "Terminer" : "Suivant"}
                  {currentIndex < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </WalkthroughContext.Provider>
  );
}
