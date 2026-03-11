-- Convert profiles.role from TEXT + CHECK to a proper ENUM
-- so it shows as a dropdown in the Supabase dashboard

-- 1. Create the enum type
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'coach', 'team', 'student');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Drop trigger depending on role column
DROP TRIGGER IF EXISTS on_profile_role_set ON public.profiles;
DROP FUNCTION IF EXISTS handle_student_profile();

-- 3. Drop ALL RLS policies that reference profiles.role
-- profiles
DROP POLICY IF EXISTS "Admin/Coach can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Team can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
-- student_details
DROP POLICY IF EXISTS "Admin/Coach can view all student_details" ON public.student_details;
DROP POLICY IF EXISTS "Admin/Coach can manage student_details" ON public.student_details;
-- student_activities
DROP POLICY IF EXISTS "Admin/Coach can view all activities" ON public.student_activities;
-- student_notes
DROP POLICY IF EXISTS "Admin/Coach can manage notes" ON public.student_notes;
-- student_tasks
DROP POLICY IF EXISTS "Admin/Coach can manage tasks" ON public.student_tasks;
-- channels
DROP POLICY IF EXISTS "Admin/Coach can manage channels" ON public.channels;
-- channel_members
DROP POLICY IF EXISTS "Admin/Coach can manage channel members" ON public.channel_members;
-- messages
DROP POLICY IF EXISTS "Admin/Coach can delete messages" ON public.messages;
-- courses
DROP POLICY IF EXISTS "Published courses visible to all" ON public.courses;
DROP POLICY IF EXISTS "Admin/Coach can manage courses" ON public.courses;
-- modules
DROP POLICY IF EXISTS "Modules visible with course" ON public.modules;
DROP POLICY IF EXISTS "Admin/Coach can manage modules" ON public.modules;
-- lessons
DROP POLICY IF EXISTS "Lessons visible with module" ON public.lessons;
DROP POLICY IF EXISTS "Admin/Coach can manage lessons" ON public.lessons;
-- lesson_progress
DROP POLICY IF EXISTS "Admin/Coach can view all progress" ON public.lesson_progress;
-- forms
DROP POLICY IF EXISTS "Active forms visible to targets" ON public.forms;
DROP POLICY IF EXISTS "Admin/Coach can manage forms" ON public.forms;
-- form_fields
DROP POLICY IF EXISTS "Fields visible with form" ON public.form_fields;
DROP POLICY IF EXISTS "Admin/Coach can manage fields" ON public.form_fields;
-- form_submissions
DROP POLICY IF EXISTS "Admin/Coach can view all submissions" ON public.form_submissions;
-- ai_insights
DROP POLICY IF EXISTS "Admin/Coach can view insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Admin/Coach can manage insights" ON public.ai_insights;
-- storage
DROP POLICY IF EXISTS "Admin/Coach can upload course assets" ON storage.objects;

-- 4. Drop the CHECK constraint and convert column
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE public.user_role USING role::public.user_role,
  ALTER COLUMN role SET DEFAULT 'student';

-- 5. Recreate trigger function + trigger
CREATE OR REPLACE FUNCTION handle_student_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' THEN
    INSERT INTO public.student_details (profile_id, tag)
    VALUES (NEW.id, 'new')
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_role_set
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_student_profile();

-- 6. Recreate ALL RLS policies (identical logic, now using enum)
-- profiles
CREATE POLICY "Admin/Coach can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Team can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Admin can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
-- student_details
CREATE POLICY "Admin/Coach can view all student_details" ON public.student_details FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);
CREATE POLICY "Admin/Coach can manage student_details" ON public.student_details FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- student_activities
CREATE POLICY "Admin/Coach can view all activities" ON public.student_activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);
-- student_notes
CREATE POLICY "Admin/Coach can manage notes" ON public.student_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);
-- student_tasks
CREATE POLICY "Admin/Coach can manage tasks" ON public.student_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);
-- channels
CREATE POLICY "Admin/Coach can manage channels" ON public.channels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- channel_members
CREATE POLICY "Admin/Coach can manage channel members" ON public.channel_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- messages
CREATE POLICY "Admin/Coach can delete messages" ON public.messages FOR DELETE USING (
  sender_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- courses
CREATE POLICY "Published courses visible to all" ON public.courses FOR SELECT USING (
  status = 'published' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Admin/Coach can manage courses" ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- modules
CREATE POLICY "Modules visible with course" ON public.modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = modules.course_id AND (
      c.status = 'published' OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    )
  )
);
CREATE POLICY "Admin/Coach can manage modules" ON public.modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- lessons
CREATE POLICY "Lessons visible with module" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND (
      c.status = 'published' OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    )
  )
);
CREATE POLICY "Admin/Coach can manage lessons" ON public.lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- lesson_progress
CREATE POLICY "Admin/Coach can view all progress" ON public.lesson_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);
-- forms
CREATE POLICY "Active forms visible to targets" ON public.forms FOR SELECT USING (
  status = 'active' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Admin/Coach can manage forms" ON public.forms FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- form_fields
CREATE POLICY "Fields visible with form" ON public.form_fields FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_fields.form_id AND (
      f.status = 'active' OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    )
  )
);
CREATE POLICY "Admin/Coach can manage fields" ON public.form_fields FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- form_submissions
CREATE POLICY "Admin/Coach can view all submissions" ON public.form_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- ai_insights
CREATE POLICY "Admin/Coach can view insights" ON public.ai_insights FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Admin/Coach can manage insights" ON public.ai_insights FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
-- storage
CREATE POLICY "Admin/Coach can upload course assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'course-assets' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
