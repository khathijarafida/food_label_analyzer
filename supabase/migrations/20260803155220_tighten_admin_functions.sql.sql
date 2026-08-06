/*
# Tighten SECURITY DEFINER function access

## Overview
Revoke EXECUTE on the admin helper functions from the anon role so
unauthenticated users cannot call them. Keep authenticated access
since both functions are designed for signed-in users:
- try_bootstrap_admin: only grants admin if zero admins exist
- is_current_admin: read-only boolean check

## Security changes
- REVOKE EXECUTE on is_current_admin() and try_bootstrap_admin() FROM anon
- Keep GRANT EXECUTE TO authenticated
*/

REVOKE EXECUTE ON FUNCTION is_current_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION try_bootstrap_admin() FROM anon;
