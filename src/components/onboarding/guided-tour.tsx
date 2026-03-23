"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, Compass } from "lucide-react";
import type { TourStep, TourPosition } from "@/lib/tour-steps";

// ─── Types ──────────────────────────────────────────────────────
interface GuidedTourProps {
  isActive: boolean;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  resolvedPosition: TourPosition;
}

// ─── Helpers ────────────────────────────────────────────────────
const PADDING = 8;
const TOOLTIP_GAP = 12;
const TOOLTIP_MAX_WIDTH = 360;

function getTargetRect(selector: string): TargetRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function computeTooltipPosition(
  targetRect: TargetRect,
  preferred: TourPosition,
  tooltipWidth: number,
  tooltipHeight: number,
): TooltipPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // targetRect is already viewport-relative (from getBoundingClientRect)
  const spaceTop = targetRect.top;
  const spaceBottom = vh - (targetRect.top + targetRect.height);
  const spaceLeft = targetRect.left;
  const spaceRight = vw - (targetRect.left + targetRect.width);

  // Try preferred position, then fallback
  const order: TourPosition[] = [preferred];
  if (preferred === "right") order.push("bottom", "left", "top");
  else if (preferred === "left") order.push("bottom", "right", "top");
  else if (preferred === "top") order.push("right", "bottom", "left");
  else order.push("right", "top", "left");

  for (const pos of order) {
    switch (pos) {
      case "right":
        if (spaceRight >= tooltipWidth + TOOLTIP_GAP + PADDING) {
          return {
            top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
            left: targetRect.left + targetRect.width + TOOLTIP_GAP,
            resolvedPosition: "right",
          };
        }
        break;
      case "left":
        if (spaceLeft >= tooltipWidth + TOOLTIP_GAP + PADDING) {
          return {
            top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
            left: targetRect.left - tooltipWidth - TOOLTIP_GAP,
            resolvedPosition: "left",
          };
        }
        break;
      case "bottom":
        if (spaceBottom >= tooltipHeight + TOOLTIP_GAP + PADDING) {
          return {
            top: targetRect.top + targetRect.height + TOOLTIP_GAP,
            left: Math.max(
              PADDING,
              Math.min(
                targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                vw - tooltipWidth - PADDING,
              ),
            ),
            resolvedPosition: "bottom",
          };
        }
        break;
      case "top":
        if (spaceTop >= tooltipHeight + TOOLTIP_GAP + PADDING) {
          return {
            top: targetRect.top - tooltipHeight - TOOLTIP_GAP,
            left: Math.max(
              PADDING,
              Math.min(
                targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                vw - tooltipWidth - PADDING,
              ),
            ),
            resolvedPosition: "top",
          };
        }
        break;
    }
  }

  // Fallback: bottom center
  return {
    top: targetRect.top + targetRect.height + TOOLTIP_GAP,
    left: Math.max(PADDING, vw / 2 - tooltipWidth / 2),
    resolvedPosition: "bottom",
  };
}

// ─── Arrow component ────────────────────────────────────────────
function TooltipArrow({ position }: { position: TourPosition }) {
  const base = "absolute w-3 h-3 bg-white dark:bg-stone-900 rotate-45";
  switch (position) {
    case "right":
      return <div className={cn(base, "-left-1.5 top-1/2 -translate-y-1/2")} />;
    case "left":
      return (
        <div className={cn(base, "-right-1.5 top-1/2 -translate-y-1/2")} />
      );
    case "top":
      return (
        <div className={cn(base, "-bottom-1.5 left-1/2 -translate-x-1/2")} />
      );
    case "bottom":
      return <div className={cn(base, "-top-1.5 left-1/2 -translate-x-1/2")} />;
  }
}

// ─── Main component ─────────────────────────────────────────────
export function GuidedTour({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: GuidedTourProps) {
  const [mounted, setMounted] = useState(false);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Find target element and compute position
  const recalculate = useCallback(() => {
    if (!currentStep) return;

    const rect = getTargetRect(currentStep.target);
    if (!rect) {
      // Target not found — skip to a fallback center position
      setTargetRect(null);
      setTooltipPos({
        top: window.innerHeight / 2 - 100,
        left: Math.max(16, window.innerWidth / 2 - TOOLTIP_MAX_WIDTH / 2),
        resolvedPosition: "bottom",
      });
      return;
    }

    setTargetRect(rect);

    // Measure tooltip
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl
      ? Math.min(tooltipEl.offsetWidth, TOOLTIP_MAX_WIDTH)
      : TOOLTIP_MAX_WIDTH;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 180;

    const pos = computeTooltipPosition(
      rect,
      currentStep.position,
      tooltipWidth,
      tooltipHeight,
    );
    setTooltipPos(pos);
  }, [currentStep]);

  // Recalculate on step change
  useEffect(() => {
    if (!isActive || !currentStep) {
      setIsVisible(false);
      return;
    }

    // Brief delay for DOM readiness and transition effect
    setIsVisible(false);
    const showTimer = setTimeout(() => {
      recalculate();
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(showTimer);
  }, [isActive, currentStep, recalculate]);

  // Recalculate on resize/scroll
  useEffect(() => {
    if (!isActive) return;

    const handler = () => recalculate();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [isActive, recalculate]);

  // Scroll target into view
  useEffect(() => {
    if (!isActive || !currentStep) return;
    const el = document.querySelector(currentStep.target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActive, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "Enter":
          e.preventDefault();
          onNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPrev();
          break;
        case "Escape":
          e.preventDefault();
          onSkip();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, onNext, onPrev, onSkip]);

  if (!mounted || !isActive || !currentStep) return null;

  // Spotlight cutout values (for box-shadow technique)
  const spotlightStyle = targetRect
    ? {
        top: targetRect.top - PADDING,
        left: targetRect.left - PADDING,
        width: targetRect.width + PADDING * 2,
        height: targetRect.height + PADDING * 2,
      }
    : null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[9999] transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      aria-modal="true"
      role="dialog"
      aria-label={`Tour guide - Étape ${currentStepIndex + 1} sur ${totalSteps}`}
    >
      {/* Overlay with spotlight cutout using box-shadow */}
      {spotlightStyle ? (
        <div
          className="absolute rounded-xl transition-all duration-300 ease-in-out"
          style={{
            top: spotlightStyle.top,
            left: spotlightStyle.left,
            width: spotlightStyle.width,
            height: spotlightStyle.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/60" />
      )}

      {/* Clickable overlay to skip */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 9998 }}
        onClick={onSkip}
      />

      {/* Tooltip card */}
      {tooltipPos && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-[10000] transition-all duration-300 ease-in-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            maxWidth: TOOLTIP_MAX_WIDTH,
            width: "max-content",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-white dark:bg-stone-900 rounded-xl shadow-2xl shadow-black/25 border border-stone-200 dark:border-stone-700/50 overflow-hidden">
            {/* Arrow */}
            <TooltipArrow position={tooltipPos.resolvedPosition} />

            {/* Content */}
            <div className="p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-tight">
                      {currentStep.title}
                    </h3>
                    <span className="text-[11px] text-stone-400 font-medium">
                      Étape {currentStepIndex + 1}/{totalSteps}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onSkip}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
                  title="Passer le tour"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                {currentStep.description}
              </p>

              {/* Step dots */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      i === currentStepIndex
                        ? "w-6 bg-primary"
                        : i < currentStepIndex
                          ? "w-2 bg-primary/40"
                          : "w-2 bg-stone-200 dark:bg-stone-700",
                    )}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={onSkip}
                  className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors font-medium"
                >
                  Passer le tour
                </button>

                <div className="flex items-center gap-2">
                  {!isFirst && (
                    <button
                      onClick={onPrev}
                      className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Precedent
                    </button>
                  )}

                  <button
                    onClick={onNext}
                    className="flex items-center gap-1 h-8 px-4 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {isLast ? "Terminer" : "Suivant"}
                    {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
