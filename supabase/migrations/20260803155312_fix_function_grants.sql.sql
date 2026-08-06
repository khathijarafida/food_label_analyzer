/*
# Fix function execute grants

## Overview
Postgres functions default to EXECUTE granted to PUBLIC (all roles).
The previous migration only revoked from anon, but PUBLIC still
covers it. Revoke from PUBLIC explicitly and grant only to authenticated.

## Security changes
- REVOKE EXECUTE ON both admin functions FROM PUBLIC
- GRANT EXECUTE only TO authenticated
*/

REVOKE EXECUTE ON FUNCTION is_current_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION try_bootstrap_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_current_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION try_bootstrap_admin() TO authenticated;
