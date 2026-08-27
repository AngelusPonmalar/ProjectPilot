-- ============ enums ============
DO $$ BEGIN
  CREATE TYPE public.project_role AS ENUM ('owner','project_manager','developer','designer','viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.invitation_status AS ENUM ('pending','accepted','declined','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ project_members ============
CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.project_role NOT NULL DEFAULT 'developer',
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- ============ project_invitations ============
CREATE TABLE IF NOT EXISTS public.project_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.project_role NOT NULL DEFAULT 'developer',
  status public.invitation_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days')
);

CREATE UNIQUE INDEX IF NOT EXISTS project_invitations_pending_unique
  ON public.project_invitations (project_id, lower(invited_email))
  WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_invitations TO authenticated;
GRANT ALL ON public.project_invitations TO service_role;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- ============ new relationship / task columns ============
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'To Do',
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS related_story text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS related_requirements jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.user_stories
  ADD COLUMN IF NOT EXISTS related_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS epic text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS goal text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS acceptance_criteria jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.ui_recommendations
  ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS related_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_stories jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS next_screens jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.architecture
  ADD COLUMN IF NOT EXISTS components jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS connections jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ============ backfill owners as members ============
INSERT INTO public.project_members (project_id, user_id, role)
SELECT p.id, p.user_id, 'owner'::public.project_role
FROM public.projects p
ON CONFLICT (project_id, user_id) DO NOTHING;

-- ============ authorization helpers ============
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = _project_id AND p.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.project_members m WHERE m.project_id = _project_id AND m.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.project_role_of(_project_id uuid)
RETURNS public.project_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.projects p WHERE p.id = _project_id AND p.user_id = auth.uid())
      THEN 'owner'::public.project_role
    ELSE (SELECT m.role FROM public.project_members m
          WHERE m.project_id = _project_id AND m.user_id = auth.uid() LIMIT 1)
  END;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_project(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.project_role_of(_project_id) IN ('owner','project_manager');
$$;

CREATE OR REPLACE FUNCTION public.shares_project_with(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members a
    JOIN public.project_members b ON a.project_id = b.project_id
    WHERE a.user_id = auth.uid() AND b.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lower(coalesce((SELECT email FROM public.profiles WHERE id = auth.uid()), ''));
$$;

REVOKE ALL ON FUNCTION public.is_project_member(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.project_role_of(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.can_manage_project(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.shares_project_with(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.current_user_email() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_project_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.project_role_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_project_with(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated;

-- ============ replace plan-data policies with membership-aware ones ============
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['requirements','user_stories','modules','ui_recommendations',
                           'architecture','database_entities','api_endpoints','sdlc_phases','project_versions']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "own project data" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "members read %1$s" ON public.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "managers write %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "members read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.is_project_member(project_id))', t);
    EXECUTE format('CREATE POLICY "managers write %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.can_manage_project(project_id)) WITH CHECK (public.can_manage_project(project_id))', t);
  END LOOP;
END $$;

-- tasks: members read; managers full write; assignees may update their own task
DROP POLICY IF EXISTS "own project data" ON public.tasks;
DROP POLICY IF EXISTS "members read tasks" ON public.tasks;
DROP POLICY IF EXISTS "managers write tasks" ON public.tasks;
DROP POLICY IF EXISTS "assignees update own tasks" ON public.tasks;
CREATE POLICY "members read tasks" ON public.tasks FOR SELECT TO authenticated
  USING (public.is_project_member(project_id));
CREATE POLICY "managers write tasks" ON public.tasks FOR ALL TO authenticated
  USING (public.can_manage_project(project_id)) WITH CHECK (public.can_manage_project(project_id));
CREATE POLICY "assignees update own tasks" ON public.tasks FOR UPDATE TO authenticated
  USING (assignee_id = auth.uid()) WITH CHECK (assignee_id = auth.uid());

-- projects: members can read; only the owner can change or delete
DROP POLICY IF EXISTS "own projects" ON public.projects;
DROP POLICY IF EXISTS "members read projects" ON public.projects;
DROP POLICY IF EXISTS "owner writes projects" ON public.projects;
DROP POLICY IF EXISTS "owner creates projects" ON public.projects;
CREATE POLICY "members read projects" ON public.projects FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_project_member(id));
CREATE POLICY "owner creates projects" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner writes projects" ON public.projects FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.can_manage_project(id))
  WITH CHECK (auth.uid() = user_id OR public.can_manage_project(id));
CREATE POLICY "owner deletes projects" ON public.projects FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- profiles: own profile, plus teammates (read only)
DROP POLICY IF EXISTS "teammates read profiles" ON public.profiles;
CREATE POLICY "teammates read profiles" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.shares_project_with(id));

-- project_members policies
DROP POLICY IF EXISTS "members read membership" ON public.project_members;
DROP POLICY IF EXISTS "managers write membership" ON public.project_members;
DROP POLICY IF EXISTS "accept own invitation" ON public.project_members;
CREATE POLICY "members read membership" ON public.project_members FOR SELECT TO authenticated
  USING (public.is_project_member(project_id));
CREATE POLICY "managers write membership" ON public.project_members FOR ALL TO authenticated
  USING (public.can_manage_project(project_id)) WITH CHECK (public.can_manage_project(project_id));
CREATE POLICY "accept own invitation" ON public.project_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.project_invitations i
      WHERE i.project_id = project_members.project_id
        AND lower(i.invited_email) = public.current_user_email()
        AND i.status = 'pending'
        AND i.expires_at > now()
        AND i.role = project_members.role
    )
  );

-- project_invitations policies
DROP POLICY IF EXISTS "members read invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "managers write invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "invitee reads own invitation" ON public.project_invitations;
DROP POLICY IF EXISTS "invitee responds to own invitation" ON public.project_invitations;
CREATE POLICY "members read invitations" ON public.project_invitations FOR SELECT TO authenticated
  USING (public.is_project_member(project_id));
CREATE POLICY "managers write invitations" ON public.project_invitations FOR ALL TO authenticated
  USING (public.can_manage_project(project_id)) WITH CHECK (public.can_manage_project(project_id));
CREATE POLICY "invitee reads own invitation" ON public.project_invitations FOR SELECT TO authenticated
  USING (lower(invited_email) = public.current_user_email());
CREATE POLICY "invitee responds to own invitation" ON public.project_invitations FOR UPDATE TO authenticated
  USING (lower(invited_email) = public.current_user_email() AND status = 'pending')
  WITH CHECK (lower(invited_email) = public.current_user_email() AND status IN ('accepted','declined'));

-- ============ assignee must be a project member ============
CREATE OR REPLACE FUNCTION public.check_task_assignee()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.project_members m
    WHERE m.project_id = NEW.project_id AND m.user_id = NEW.assignee_id
  ) THEN
    RAISE EXCEPTION 'Assignee must be a member of this project';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tasks_assignee_check ON public.tasks;
CREATE TRIGGER tasks_assignee_check BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.check_task_assignee();

-- ============ updated_at triggers for new tables ============
DROP TRIGGER IF EXISTS project_members_updated ON public.project_members;
CREATE TRIGGER project_members_updated BEFORE UPDATE ON public.project_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS project_invitations_updated ON public.project_invitations;
CREATE TRIGGER project_invitations_updated BEFORE UPDATE ON public.project_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ new owner auto-membership ============
CREATE OR REPLACE FUNCTION public.add_owner_membership()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT (project_id, user_id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS projects_owner_membership ON public.projects;
CREATE TRIGGER projects_owner_membership AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_membership();