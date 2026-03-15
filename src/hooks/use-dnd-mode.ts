"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "off-market-dnd";

interface DndState {
  enabled: boolean;
  until: string | null; // ISO date string
}

function loadState(): DndState {
  if (typeof window === "undefined") return { enabled: false, until: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, until: null };
    const parsed = JSON.parse(raw) as DndState;

    // Auto-disable if scheduled time has passed
    if (parsed.until && new Date(parsed.until).getTime() < Date.now()) {
      const expired: DndState = { enabled: false, until: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expired));
      return expired;
    }

    return parsed;
  } catch {
    return { enabled: false, until: null };
  }
}

function saveState(state: DndState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useDndMode() {
  const [state, setState] = useState<DndState>(loadState);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setState(loadState());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Auto-disable timer
  useEffect(() => {
    if (!state.enabled || !state.until) return;

    const untilMs = new Date(state.until).getTime();
    const remaining = untilMs - Date.now();

    if (remaining <= 0) {
      const next: DndState = { enabled: false, until: null };
      setState(next);
      saveState(next);
      return;
    }

    const timer = setTimeout(() => {
      const next: DndState = { enabled: false, until: null };
      setState(next);
      saveState(next);
    }, remaining);

    return () => clearTimeout(timer);
  }, [state.enabled, state.until]);

  const enableDnd = useCallback(() => {
    const next: DndState = { enabled: true, until: null };
    setState(next);
    saveState(next);
  }, []);

  const disableDnd = useCallback(() => {
    const next: DndState = { enabled: false, until: null };
    setState(next);
    saveState(next);
  }, []);

  const toggleDnd = useCallback(() => {
    setState((prev) => {
      const next: DndState = { enabled: !prev.enabled, until: null };
      saveState(next);
      return next;
    });
  }, []);

  const setDndUntil = useCallback((date: Date) => {
    const next: DndState = { enabled: true, until: date.toISOString() };
    setState(next);
    saveState(next);
  }, []);

  return {
    isDnd: state.enabled,
    dndUntil: state.until ? new Date(state.until) : null,
    toggleDnd,
    enableDnd,
    disableDnd,
    setDndUntil,
  };
}
