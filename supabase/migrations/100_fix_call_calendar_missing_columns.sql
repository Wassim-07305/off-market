-- ═══════════════════════════════════════════════════════════════
-- 100 — Add missing columns to call_calendar
-- Migration 034 may not have run; these columns are needed for
-- reschedule and satisfaction features.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.call_calendar
  ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
  ADD COLUMN IF NOT EXISTS original_date DATE,
  ADD COLUMN IF NOT EXISTS original_time TIME,
  ADD COLUMN IF NOT EXISTS satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5);
