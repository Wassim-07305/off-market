-- ═══════════════════════════════════════════════════════════════
-- 092 — Fix messaging (defensive version)
-- Each block is independent — errors are swallowed, never stop execution
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. ADD MISSING COLUMNS ──────────────────────────────────

DO $$ BEGIN ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS description     TEXT;                       EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS is_default      BOOLEAN DEFAULT false;      EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS is_archived     BOOLEAN DEFAULT false;      EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;               EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS avatar_url      TEXT;                       EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS write_mode      TEXT DEFAULT 'all';         EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS archived_at     TIMESTAMPTZ;               EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS archived_by     UUID;                       EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.channel_members ADD COLUMN IF NOT EXISTS role                TEXT    DEFAULT 'member'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channel_members ADD COLUMN IF NOT EXISTS notifications_muted BOOLEAN DEFAULT false;   EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channel_members ADD COLUMN IF NOT EXISTS is_pinned           BOOLEAN DEFAULT false;   EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.channel_members ADD COLUMN IF NOT EXISTS last_read_at        TIMESTAMPTZ DEFAULT now(); EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content_type TEXT    DEFAULT 'text'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;            EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reactions     JSONB   DEFAULT '{}';  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_urgent     BOOLEAN DEFAULT false; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_pinned     BOOLEAN DEFAULT false; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachments   JSONB   DEFAULT '[]';  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to      UUID REFERENCES public.messages(id) ON DELETE SET NULL; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS scheduled_at  TIMESTAMPTZ; EXCEPTION WHEN others THEN NULL; END $$;

-- ─── 2. UNIQUE CONSTRAINT channel_members(channel_id, profile_id) ────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'channel_members_channel_id_profile_id_key'
  ) THEN
    ALTER TABLE public.channel_members
      ADD CONSTRAINT channel_members_channel_id_profile_id_key
      UNIQUE (channel_id, profile_id);
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 3. FIX channels.type CONSTRAINT ─────────────────────────
DO $$ BEGIN
  ALTER TABLE public.channels DROP CONSTRAINT IF EXISTS channels_type_check;
  ALTER TABLE public.channels ADD CONSTRAINT channels_type_check
    CHECK (type IN ('public', 'private', 'dm', 'direct', 'group'));
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 4. RECREATE is_channel_member() ─────────────────────────
-- CASCADE drops all dependent policies (they are all recreated below)
DROP FUNCTION IF EXISTS public.is_channel_member(uuid) CASCADE;

CREATE FUNCTION public.is_channel_member(p_channel_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members
    WHERE channel_id = p_channel_id
      AND profile_id = auth.uid()
  );
$$;

-- ─── 5. CHANNELS RLS ─────────────────────────────────────────
DO $$ BEGIN ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN DROP POLICY IF EXISTS channels_select ON public.channels; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS channels_admin  ON public.channels; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS channels_insert ON public.channels; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS channels_update ON public.channels; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS channels_delete ON public.channels; EXCEPTION WHEN others THEN NULL; END $$;

CREATE POLICY channels_select ON public.channels FOR SELECT USING (
  type = 'public'
  OR is_channel_member(id)
  OR created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
);

CREATE POLICY channels_insert ON public.channels FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
);

CREATE POLICY channels_update ON public.channels FOR UPDATE USING (
  created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
);

CREATE POLICY channels_delete ON public.channels FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── 6. CHANNEL_MEMBERS RLS ──────────────────────────────────
DO $$ BEGIN ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN DROP POLICY IF EXISTS channel_members_select ON public.channel_members; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS channel_members_admin  ON public.channel_members; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS channel_members_insert ON public.channel_members; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS channel_members_update ON public.channel_members; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS channel_members_delete ON public.channel_members; EXCEPTION WHEN others THEN NULL; END $$;

CREATE POLICY channel_members_select ON public.channel_members FOR SELECT USING (
  is_channel_member(channel_id)
  OR profile_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
);

CREATE POLICY channel_members_insert ON public.channel_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND created_by = auth.uid())
  OR (profile_id = auth.uid() AND EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND type = 'public'))
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
);

CREATE POLICY channel_members_update ON public.channel_members FOR UPDATE USING (
  profile_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
);

CREATE POLICY channel_members_delete ON public.channel_members FOR DELETE USING (
  profile_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND created_by = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
);

-- ─── 7. MESSAGES RLS ─────────────────────────────────────────
DO $$ BEGIN ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN DROP POLICY IF EXISTS messages_select     ON public.messages; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS messages_insert     ON public.messages; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS messages_update_own ON public.messages; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS messages_delete     ON public.messages; EXCEPTION WHEN others THEN NULL; END $$;

CREATE POLICY messages_select ON public.messages FOR SELECT USING (
  is_channel_member(channel_id)
  OR EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND type = 'public')
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
);

CREATE POLICY messages_insert ON public.messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND (
    is_channel_member(channel_id)
    OR EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND type = 'public')
  )
  AND (
    COALESCE((SELECT write_mode FROM public.channels WHERE id = channel_id), 'all') = 'all'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
  )
);

CREATE POLICY messages_update_own ON public.messages FOR UPDATE USING (
  sender_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
);

CREATE POLICY messages_delete ON public.messages FOR DELETE USING (
  sender_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','coach'))
);

-- ─── 8. MESSAGE_READS RLS (only if table exists) ─────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='message_reads') THEN
    ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS message_reads_own ON public.message_reads;
    -- Detect whether the column is user_id or profile_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='message_reads' AND column_name='user_id') THEN
      EXECUTE $p$ CREATE POLICY message_reads_own ON public.message_reads FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); $p$;
    ELSE
      EXECUTE $p$ CREATE POLICY message_reads_own ON public.message_reads FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid()); $p$;
    END IF;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 9. MESSAGE_ATTACHMENTS RLS (only if table exists) ───────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='message_attachments') THEN
    ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Members can view attachments"   ON public.message_attachments;
    DROP POLICY IF EXISTS "Senders can manage attachments" ON public.message_attachments;
    EXECUTE $p$
      CREATE POLICY "Members can view attachments" ON public.message_attachments FOR SELECT
        USING (is_channel_member((SELECT channel_id FROM public.messages WHERE id = message_id)));
    $p$;
    EXECUTE $p$
      CREATE POLICY "Senders can manage attachments" ON public.message_attachments FOR ALL
        USING (EXISTS (SELECT 1 FROM public.messages WHERE id = message_id AND sender_id = auth.uid()));
    $p$;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 10. MESSAGE_REACTIONS RLS (only if table exists) ────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='message_reactions') THEN
    ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Members can view reactions"  ON public.message_reactions;
    DROP POLICY IF EXISTS "Users manage own reactions"  ON public.message_reactions;
    EXECUTE $p$
      CREATE POLICY "Members can view reactions" ON public.message_reactions FOR SELECT
        USING (is_channel_member((SELECT channel_id FROM public.messages WHERE id = message_id)));
    $p$;
    -- detect profile_id vs user_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='message_reactions' AND column_name='profile_id') THEN
      EXECUTE $p$ CREATE POLICY "Users manage own reactions" ON public.message_reactions FOR ALL USING (profile_id = auth.uid()); $p$;
    ELSE
      EXECUTE $p$ CREATE POLICY "Users manage own reactions" ON public.message_reactions FOR ALL USING (user_id = auth.uid()); $p$;
    END IF;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 11. INDEXES ─────────────────────────────────────────────
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_channel_members_profile_id      ON public.channel_members(profile_id);                                        EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_channel_members_channel_profile  ON public.channel_members(channel_id, profile_id);                            EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_channels_type                    ON public.channels(type);                                                      EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_channels_archived                ON public.channels(is_archived) WHERE is_archived = false;                     EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_messages_channel_created         ON public.messages(channel_id, created_at DESC) WHERE deleted_at IS NULL;      EXCEPTION WHEN others THEN NULL; END $$;
