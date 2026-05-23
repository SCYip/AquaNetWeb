-- ============================================================================
-- AquaNet 水眸 · phone auth + public profiles
-- ----------------------------------------------------------------------------
-- Adds:
--   • public.profiles  — mirror of auth.users for frontend reads
--   • handle_new_user() trigger — creates a profile when auth.users gets a row
--   • handle_user_update() trigger — keeps profile in sync with user_metadata
--   • unique index on profiles.phone
--   • RLS policies (public read, owner-only update)
--
-- Idempotent: safe to run multiple times.
-- ============================================================================


-- 1 · Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text,
  phone       text,
  email       text,
  auth_type   text CHECK (auth_type IN ('email', 'phone', 'wechat')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS
  'Public mirror of auth.users. Holds display name + phone for frontend reads. '
  'Auto-populated and synced from auth.users via triggers.';


-- 2 · Unique phone (when set) -------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone
  ON public.profiles (phone)
  WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_auth_type
  ON public.profiles (auth_type);


-- 3 · Helper: classify auth_type from user metadata --------------------------
CREATE OR REPLACE FUNCTION public._derive_auth_type(meta jsonb, email text, phone text)
RETURNS text
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  m text;
BEGIN
  m := nullif(meta->>'auth_type', '');
  IF m IS NOT NULL THEN
    RETURN m;
  END IF;
  IF phone IS NOT NULL AND phone <> '' THEN
    RETURN 'phone';
  END IF;
  IF email LIKE '%@phone.aquanet.local' THEN
    RETURN 'phone';
  END IF;
  IF email IS NOT NULL AND email <> '' THEN
    RETURN 'email';
  END IF;
  RETURN 'email';
END;
$$;


-- 4 · Helper: pick the user-facing email (NULL for synthetic phone emails) ---
CREATE OR REPLACE FUNCTION public._real_email(email text)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN email IS NULL OR email LIKE '%@phone.aquanet.local' THEN NULL
    ELSE email
  END;
$$;


-- 5 · Trigger fn: on auth.users INSERT ---------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_phone text := nullif(NEW.raw_user_meta_data->>'phone', '');
  meta_name  text := coalesce(
                       nullif(NEW.raw_user_meta_data->>'name', ''),
                       nullif(NEW.raw_user_meta_data->>'full_name', '')
                     );
  effective_phone text := coalesce(NEW.phone, meta_phone);
BEGIN
  INSERT INTO public.profiles (id, name, phone, email, auth_type, created_at, updated_at)
  VALUES (
    NEW.id,
    coalesce(meta_name, '用户' || coalesce(right(effective_phone, 4), substring(NEW.id::text, 1, 4))),
    effective_phone,
    public._real_email(NEW.email),
    public._derive_auth_type(NEW.raw_user_meta_data, NEW.email, effective_phone),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- 6 · Trigger fn: on auth.users UPDATE ---------------------------------------
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_phone text := nullif(NEW.raw_user_meta_data->>'phone', '');
  meta_name  text := coalesce(
                       nullif(NEW.raw_user_meta_data->>'name', ''),
                       nullif(NEW.raw_user_meta_data->>'full_name', '')
                     );
  effective_phone text := coalesce(NEW.phone, meta_phone);
BEGIN
  UPDATE public.profiles SET
    name       = coalesce(meta_name, profiles.name),
    phone      = coalesce(effective_phone, profiles.phone),
    email      = public._real_email(NEW.email),
    auth_type  = public._derive_auth_type(NEW.raw_user_meta_data, NEW.email, effective_phone),
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;


-- 7 · Wire triggers ----------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();


-- 8 · Backfill: ensure every existing auth.users has a profiles row ----------
INSERT INTO public.profiles (id, name, phone, email, auth_type, created_at, updated_at)
SELECT
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data->>'name', ''),
    nullif(u.raw_user_meta_data->>'full_name', ''),
    '用户' || coalesce(right(coalesce(u.phone, u.raw_user_meta_data->>'phone'), 4), substring(u.id::text, 1, 4))
  ),
  coalesce(u.phone, nullif(u.raw_user_meta_data->>'phone', '')),
  public._real_email(u.email),
  public._derive_auth_type(u.raw_user_meta_data, u.email, coalesce(u.phone, u.raw_user_meta_data->>'phone')),
  u.created_at,
  now()
FROM auth.users u
ON CONFLICT (id) DO NOTHING;


-- 9 · RLS --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if re-running
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

-- Anyone (including anon) can read display names — needed for buoy owner
-- bylines on the public map and 公众来信 author rendering.
CREATE POLICY profiles_select_all
  ON public.profiles
  FOR SELECT
  USING (true);

-- Only the owner can update their own profile row.
CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No public INSERT policy: rows are created exclusively by the
-- on_auth_user_created trigger (SECURITY DEFINER bypasses RLS).
-- No DELETE policy: ON DELETE CASCADE from auth.users handles cleanup.


-- 10 · Grants ----------------------------------------------------------------
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE (name) ON public.profiles TO authenticated;
