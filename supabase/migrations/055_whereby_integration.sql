-- ═══════════════════════════════════════
-- 055 – Whereby Embedded integration
-- ═══════════════════════════════════════

-- Add Whereby room columns to call_calendar
ALTER TABLE public.call_calendar
  ADD COLUMN IF NOT EXISTS whereby_room_url TEXT,
  ADD COLUMN IF NOT EXISTS whereby_host_url TEXT,
  ADD COLUMN IF NOT EXISTS whereby_meeting_id TEXT;

-- Index for quick lookup by meeting ID
CREATE INDEX IF NOT EXISTS idx_call_calendar_whereby_meeting
  ON public.call_calendar (whereby_meeting_id)
  WHERE whereby_meeting_id IS NOT NULL;
