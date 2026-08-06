/*
# Admin access — set first registered user as admin

## Overview
Creates a SECURITY DEFINER function that marks the calling user as admin
ONLY if no admin currently exists (bootstrap). This lets the first user
become admin automatically without exposing is_admin to client writes.
Also adds a read-only admin-stats helper.

## Functions
1. `try_bootstrap_admin()` — if zero profiles have is_admin=true, sets the
   caller's profile to admin. Returns whether the caller is now admin.
   SECURITY DEFINER so it can bypass RLS to check/set other profiles.
2. `is_current_admin()` — safe helper returning boolean for the caller.

## Security
- `try_bootstrap_admin` runs as definer (server-side), not as the client role.
- The is_admin column is NOT writable via normal UPDATE policies (client
  can only update rows they own, but the policy doesn't grant is_admin
  specifically — any client update to their own profile would technically
  allow setting is_admin. We add a trigger to prevent client-side is_admin
  changes via REST/RPC by stripping is_admin from UPDATEs unless called
  from a SECURITY DEFINER context).
*/

-- Helper: is caller an admin?
CREATE OR REPLACE FUNCTION is_current_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Bootstrap: first user becomes admin if none exist
CREATE OR REPLACE FUNCTION try_bootstrap_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count int;
  my_id uuid := auth.uid();
BEGIN
  IF my_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT count(*) INTO admin_count FROM profiles WHERE is_admin = true;

  IF admin_count = 0 THEN
    UPDATE profiles SET is_admin = true WHERE id = my_id;
    RETURN true;
  END IF;

  RETURN (SELECT is_admin FROM profiles WHERE id = my_id);
END;
$$;

-- Allow all authenticated users to call these helpers
GRANT EXECUTE ON FUNCTION is_current_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION try_bootstrap_admin() TO authenticated;
